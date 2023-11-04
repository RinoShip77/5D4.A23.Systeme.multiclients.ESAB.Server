import expressValidator from 'express-validator';
const { body } = expressValidator;

class ExplorerValidators {
  complete() {
    return [
      body('firstName').exists().withMessage('Requis'),
      body('lastName').exists().withMessage('Requis'),
      body('username').exists().withMessage('Requis'),
      body('email').exists().withMessage('Requis'),
      body('planet').exists().withMessage('Requis'),
      body('birthday').exists(),
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