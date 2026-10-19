const mongoose = require('mongoose');

// build a parent class for general order validation rule
class OrderValidationRule{
    constructor(errorMessage) {
    this.errorMessage = errorMessage;
  }
  validate(items) {
    return this.isValid(items) ? null : this.errorMessage;
  }
  isValid() {
    throw new Error('A child class must implement isValid().');
  }
}

//To check order must have at least one menu item
//Inherit from OrderValidation
class ItemsRequiredRule extends OrderValidationRule {
  constructor() {
    super('Select at least one menu item.');
  }

  isValid(items) {
    return Array.isArray(items) && items.length > 0;
  }
}

//To check the quantityNumber must be atleast one and integer
//Inherit from OrderValidation
class QuantityRule extends OrderValidationRule {
  constructor() {
    super('Each quantity must be a positive whole number.');
  }

  isValid(items) {
    return items.every(
      (item) =>
        item &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    );
  }
}

//To check the Menu item object id must be valid
//Inherit from OrderValidation
class MenuItemIdRule extends OrderValidationRule {
  constructor() {
    super('A menu item ID is invalid.');
  }

  isValid(items) {
    return items.every(
      (item) =>
        item &&
        typeof item.menuItem === 'string' &&
        mongoose.isValidObjectId(item.menuItem)
    );
  }
}

//create all three objects and using for loop to call their validate methods --> isValid$
const validateOrderInput = (req, res, next) => {
  const items = req.body?.items;

  // first confirm that list is not empty and then check
  const rules = [
    new ItemsRequiredRule(),
    new QuantityRule(),
    new MenuItemIdRule(),
  ];

  for (const rule of rules) {
    const errorMessage = rule.validate(items);

    if (errorMessage) {
      return res.status(400).json({ message: errorMessage });
    }
  }

  next(); // pass to add order
};

module.exports = { validateOrderInput };