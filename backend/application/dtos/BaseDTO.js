class BaseDTO {
  validate() {
    throw new Error('validate method must be implemented');
  }
}

module.exports = BaseDTO;

