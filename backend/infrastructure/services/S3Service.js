const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

class S3Service {
    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
        this.bucketName = process.env.AWS_S3_BUCKET_NAME;
    }

    /**
     * Sube un archivo a S3
     * @param {Buffer} fileBuffer - Buffer del archivo
     * @param {string} key - Ruta/nombre del archivo en S3
     * @param {string} contentType - MIME type del archivo
     * @returns {Promise<string>} - URL del archivo subido
     */
    async uploadFile(fileBuffer, key, contentType) {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: fileBuffer,
                ContentType: contentType,
                ServerSideEncryption: 'AES256'
            });

            await this.s3Client.send(command);

            return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        } catch (error) {
            console.error('Error al subir archivo a S3:', error);
            throw new Error('Error al subir archivo a S3: ' + error.message);
        }
    }

    /**
     * Elimina un archivo de S3
     * @param {string} key - Ruta/nombre del archivo en S3
     */
    async deleteFile(key) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });

            await this.s3Client.send(command);
        } catch (error) {
            console.error('Error al eliminar archivo de S3:', error);
            throw new Error('Error al eliminar archivo de S3: ' + error.message);
        }
    }

    /**
     * Genera una URL firmada temporal para acceder al archivo
     * @param {string} key - Ruta/nombre del archivo en S3
     * @param {number} expiresIn - Tiempo de expiración en segundos (default: 1 hora)
     * @returns {Promise<string>} - URL firmada
     */
    async getSignedUrl(key, expiresIn = 3600) {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });

            const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
            return signedUrl;
        } catch (error) {
            console.error('Error al generar URL firmada:', error);
            throw new Error('Error al generar URL firmada: ' + error.message);
        }
    }

    /**
     * Verifica si un archivo existe en S3
     * @param {string} key - Ruta/nombre del archivo en S3
     * @returns {Promise<boolean>}
     */
    async fileExists(key) {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });

            await this.s3Client.send(command);
            return true;
        } catch (error) {
            if (error.name === 'NoSuchKey') {
                return false;
            }
            throw error;
        }
    }
}

module.exports = S3Service;
