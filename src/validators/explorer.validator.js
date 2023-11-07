import expressValidator from 'express-validator';
const { body } = expressValidator;

class ExplorerValidators {
  complete() {
    return [
      body('name').exists().withMessage('Requis'),
      body('surname').exists().withMessage('Requis'),
      body('username').exists().withMessage('Requis'),
      body('email').exists().withMessage('Requis'),
      body('password').exists().withMessage('Requis'),
      //...this.partial()
    ];
  }

  // Pas pour le moment, discuter avec les autres avant

//   partial() {
//     return [

//     ];
//   }
}

export default new ExplorerValidators();