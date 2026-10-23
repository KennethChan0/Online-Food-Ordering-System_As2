// Shared interface and validation for role-specific profile strategies. Abstraction
class ProfileRules {
    getEditableFields() {
        throw new Error('A profile strategy must define its editable fields.');
    }

    // Return an error message, or null when all profile data is valid.
    validate(body) {
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return 'Invalid profile data';
        }
        // Encapsulation
        const allowedFields = this.getEditableFields();

        if (Object.keys(body).some((field) => !allowedFields.includes(field))) {
            return 'Only editable profile fields can be updated';
        }

        if (typeof body.name !== 'string' || typeof body.phone !== 'string') {
            return 'Name and phone number are required';
        }

        const name = body.name.trim();
        const phone = body.phone.trim();
        const digits = phone.replace(/\D/g, '');

        if (!name || name.length > 80) {
            return 'Name must contain 1 to 80 characters';
        }

        if (
            !/^\+?[0-9 ()-]+$/.test(phone) ||
            phone.length > 25 ||
            digits.length < 7 ||
            digits.length > 15
        ) {
            return 'Please enter a valid phone number';
        }

        return null;
    }

    buildProfile(user) {
        return {
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role
        };
    }
}
// inheritance
class CustomerProfileRules extends ProfileRules {
    getEditableFields() {
        return ['name', 'phone'];
    }
}
// inheritance
class RestaurantProfileRules extends ProfileRules {
    getEditableFields() {
        return ['name', 'phone', 'restaurantAddress'];
    }
// inheritance
    validate(body) {
        const errorMessage = super.validate(body);

        if (errorMessage) {
            return errorMessage;
        }

        if (typeof body.restaurantAddress !== 'string') {
            return 'Restaurant address is required';
        }

        const restaurantAddress = body.restaurantAddress.trim();

        if (!restaurantAddress || restaurantAddress.length > 300) {
            return 'Restaurant address must contain 1 to 300 characters';
        }

        return null;
    }
// inheritance
    buildProfile(user) {
        return {
            ...super.buildProfile(user),
            restaurantAddress: user.restaurantAddress || ''
        };
    }
}

// Encapsulation
// Strategies are stateless; a new role only needs a strategy and a map entry.
const customerRules = new CustomerProfileRules();
const rulesByRole = new Map([
    ['customer', customerRules],
    ['restaurant', new RestaurantProfileRules()]
]);

const getProfileRules = (role) => rulesByRole.get(role) || customerRules;

module.exports = {
    ProfileRules,
    CustomerProfileRules,
    RestaurantProfileRules,
    getProfileRules
};
