const knex = require('knex')(require('../knexfile'));

module.exports = class PasswordResetCode {
    static async replaceForUser(userId, codeHash, expiresAt) {
        await knex('password_reset_codes')
            .where({ user_id: userId })
            .whereNull('used_at')
            .update({ used_at: knex.fn.now() });

        return knex('password_reset_codes').insert({
            user_id: userId,
            code_hash: codeHash,
            expires_at: expiresAt,
        });
    }

    static getActiveForUser(userId) {
        return knex('password_reset_codes')
            .where({ user_id: userId })
            .whereNull('used_at')
            .where('expires_at', '>', knex.fn.now())
            .orderBy('created_at', 'desc')
            .first();
    }

    static incrementAttempts(id) {
        return knex('password_reset_codes').where({ id }).increment('attempts', 1);
    }

    static consume(id) {
        return knex('password_reset_codes')
            .where({ id })
            .whereNull('used_at')
            .update({ used_at: knex.fn.now() });
    }
};
