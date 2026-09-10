/**
 * One-time bootstrap script: creates the very first SUPER_ADMIN account.
 *
 * WHY THIS SCRIPT EXISTS:
 * Every account with an elevated role (TEACHER, ADMIN, SUPER_ADMIN) can
 * only be created through POST /api/v1/users, which is itself gated by
 * authorize(ADMIN, SUPER_ADMIN) (see routes/user.routes.js). Public
 * self-registration (POST /auth/register) is hard-locked to STUDENT
 * (see services/auth.service.js) as a deliberate security fix. That
 * leaves no HTTP-reachable way to create the FIRST admin account on a
 * fresh database — this script is that one deliberate escape hatch,
 * meant to be run directly against the database, never exposed over
 * HTTP.
 *
 * USAGE:
 *   SUPER_ADMIN_EMAIL=admin@example.com SUPER_ADMIN_PASSWORD=ChangeMe123 node scripts/seedSuperAdmin.js
 *
 * SAFETY:
 *   - Refuses to run if a user with that email already exists (idempotent).
 *   - Refuses to run if ANY SUPER_ADMIN already exists in the database,
 *     unless FORCE_SEED=true is explicitly set — this prevents someone
 *     from accidentally re-running this script in production and being
 *     confused about which admin account is "the" admin.
 *   - Password is never logged; only a success confirmation is printed.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../src/config/database');
const logger = require('../src/config/logger');
const { User } = require('../src/models');
const { USER_ROLES } = require('../src/constants/appConstants');

async function seedSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME || 'System Administrator';
  const forceSeed = process.env.FORCE_SEED === 'true';

  if (!email || !password) {
    logger.error(
      'SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD environment variables are required. Aborting.'
    );
    process.exit(1);
  }

  if (password.length < 8 || !/\d/.test(password)) {
    logger.error(
      'SUPER_ADMIN_PASSWORD must be at least 8 characters and contain at least one number. Aborting.'
    );
    process.exit(1);
  }

  await connectDatabase();

  try {
    const existingByEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingByEmail) {
      logger.warn(
        `A user with email "${email}" already exists (role: ${existingByEmail.role}). No action taken.`
      );
      return;
    }

    const existingSuperAdminCount = await User.countDocuments({ role: USER_ROLES.SUPER_ADMIN });
    if (existingSuperAdminCount > 0 && !forceSeed) {
      logger.warn(
        `${existingSuperAdminCount} SUPER_ADMIN account(s) already exist. Refusing to create another without FORCE_SEED=true.`
      );
      return;
    }

    const superAdmin = await User.create({
      name,
      email,
      password, // hashed automatically by the User model's pre('save') hook
      role: USER_ROLES.SUPER_ADMIN,
      isActive: true,
    });

    logger.info(
      `SUPER_ADMIN account created successfully: ${superAdmin.email} (id: ${superAdmin._id})`
    );
    logger.info(
      'You can now log in via POST /api/v1/auth/login and use this account to create ADMIN/TEACHER users via POST /api/v1/users.'
    );
  } catch (error) {
    logger.error(`Failed to seed SUPER_ADMIN: ${error.message}\n${error.stack}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seedSuperAdmin();
