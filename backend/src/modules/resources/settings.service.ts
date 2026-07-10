import fs from 'fs';
import path from 'path';
import { ApiError } from '../../shared/ApiError';
import { HTTP_STATUS } from '../../core/utils/constants';

export interface PasswordPolicy {
  minimumLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  enableExpiration: boolean;
  preventReuse: number;
}

export interface Settings {
  passwordPolicy: PasswordPolicy;
}

const SETTINGS_FILE = path.join(__dirname, '../../../data/settings.json');

const DEFAULT_SETTINGS: Settings = {
  passwordPolicy: {
    minimumLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    enableExpiration: false,
    preventReuse: 5,
  },
};

let memorySettings: Settings | null = null;

export const getSettings = (): Settings => {
  if (memorySettings) return memorySettings;
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      const dir = path.dirname(SETTINGS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
      return DEFAULT_SETTINGS;
    }
    const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading settings file, returning defaults', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: Partial<Settings>): Settings => {
  try {
    const current = getSettings();
    const updated = {
      ...current,
      ...settings,
      passwordPolicy: {
        ...current.passwordPolicy,
        ...settings.passwordPolicy,
      },
    };
    try {
      const dir = path.dirname(SETTINGS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2));
    } catch (fsError) {
      console.warn('Could not write to file system. Falling back to memory storage.');
      memorySettings = updated;
    }
    return updated;
  } catch (error) {
    console.error('Error saving settings file', error);
    throw error;
  }
};

export const validatePasswordAgainstPolicy = (password: string) => {
  const settings = getSettings();
  const policy = settings.passwordPolicy;
  const errors: string[] = [];

  if (password.length < policy.minimumLength) {
    errors.push(`Password must be at least ${policy.minimumLength} characters`);
  }
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (policy.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (policy.requireSymbols && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  return { isValid: true, errors: [] };
};
