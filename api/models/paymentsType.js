const knex = require('knex')(require('../knexfile'));
module.exports = class PaymentsType {
    constructor(id) {
        this.id = id;
    }
    /**
     * Get all payment types
     * @returns {Object}
     */
    static getPaymentTypes() {
        return knex('payments_type')
            .select()
            .then((paymentTypes) => {
                return paymentTypes;
            })
            .catch((error) => {
                throw error;
            });
    }

    /**
     * Get payment type by name
     * @param {string} name
     * @returns {Object}
     */
    static getPaymentTypeByName(name) {
        return knex('payments_type')
            .select()
            .where('name', name)
            .then((paymentTypes) => {
                return paymentTypes;
            })
            .catch((error) => {
                throw error;
            });
    }
};
module.exports.CASH_PAYMENT_ID = 4;
