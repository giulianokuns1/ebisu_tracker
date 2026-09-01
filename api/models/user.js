const bcrypt = require('bcrypt');
const knex = require('knex')(require('../knexfile'));

module.exports = class User {
    constructor(id, firstname, lastname, email, password) {
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
    }

    /**
     * Get all users
     * @returns {Promise<Object>}
     */
    static fetchAll() {
        return knex('users')
            .select()
            .then((users) => {
                return users;
            })
            .catch((error) => {
                throw error;
            });
    }

    /**
     * Get user by email
     * @param {string} email
     * @returns {Promise<Object>}
     */
    static getByEmail(email) {
        return knex('users')
            .select()
            .where('email', email)
            .then((users) => {
                return users[0];
            })
            .catch((error) => {
                throw error;
            });
    }

    /**
     * Create a new user
     * @param {string} firstname
     * @param {string} lastname
     * @param {string} email
     * @param {string} password
     * @param googleToken
     * @returns {Promise<Object>}
     */
    static async createUser(firstname, lastname, email, password, googleToken) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const [userId] = await knex('users').insert({
                firstname,
                lastname,
                email,
                password: hashedPassword,
                google_token: googleToken
            });
            return userId;
        } catch (error) {
            throw error;
        }
    }

    static async comparePasswords(inputPassword, hashedPassword) {
        return bcrypt.compare(inputPassword, hashedPassword);
    }

    static updatePassword(id, password) {
        return bcrypt.hash(password, 10).then((hashedPassword) => knex('users')
            .where({ id })
            .update({ password: hashedPassword, token: null, token_expiration: null }));
    }

    static async getById(id) {
        return knex('users').select().where('id', id).first();
    }

    /**
     * Update the user's token and token_expiration in the database
     * @param {number} userId - The ID of the user
     * @param {string} token - The JWT token to set
     * @param {Date} expiration - The token expiration timestamp
     * @returns {Promise<void>}
     */
    static async updateToken(userId, token, expiration) {
        try {
            await knex('users')
                .where('id', userId)
                .update({
                    token,
                    token_expiration: expiration,
                });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update user
     * @param id
     * @param firstname
     * @param lastname
     * @param email
     * @returns {Knex.QueryBuilder<TRecord, number>}
     */
    static updateUser(id, firstname, lastname, email, defaultCurrencyId = null ) {
        return knex('users')
            .where({
                id: id
            })
            .update({
                firstname: firstname,
                lastname: lastname,
                email: email,
                default_currency_id: defaultCurrencyId
            });
    }

    static updateDefaultCurrency(id, defaultCurrencyId) {
        return knex('users')
            .where({ id: id })
            .update({ default_currency_id: defaultCurrencyId });
    }

    static updateDashboardPreferences(id, dashboardShowNextMonth) {
        return knex('users')
            .where({ id })
            .update({ dashboard_show_next_month: dashboardShowNextMonth });
    }

    static updateTimezone(id, timezone) {
        return knex('users')
            .where({ id })
            .update({ timezone });
    }
    /**
     * Update user
     * @param id
     * @param googleToken
     * @returns {Knex.QueryBuilder<TRecord, number>}
     */
    static updateGoogleToken(id, googleToken) {
        return knex('users')
            .where({
                id: id
            })
            .update({
                google_token: googleToken
            });
    }
};
