const express = require('express');
const EvidenciaController = require('../controllers/EvidenciaController');
const upload = require('../middlewares/upload');

const router = express.Router();
const evidenciaController = new EvidenciaController();

// GET /api/evidencias - Obtener todas las evidencias
router.get('/', (req, res) => evidenciaController.getAll(req, res));

// GET /api/evidencias/orden/:idOrden - Obtener evidencias de una orden específica
router.get('/orden/:idOrden', (req, res) => evidenciaController.getByOrden(req, res));

// POST /api/evidencias - Crear una nueva evidencia (con archivo)
router.post('/', upload.single('file'), (req, res) => evidenciaController.create(req, res));

// PUT /api/evidencias/:id - Actualizar una evidencia
router.put('/:id', (req, res) => evidenciaController.update(req, res));

// DELETE /api/evidencias/:id - Eliminar una evidencia
router.delete('/:id', (req, res) => evidenciaController.delete(req, res));

module.exports = router;
