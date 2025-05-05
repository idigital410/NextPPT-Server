import crypto from 'crypto';

/**
 * 生成随机盐值
 * @returns 16字节的随机盐值（十六进制字符串）
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * 使用MD5和盐值对密码进行哈希处理
 * @param password 原始密码
 * @param salt 盐值
 * @returns 哈希后的密码
 */
export function hashPassword(password: string, salt: string): string {
  const hash = crypto.createHash('md5')
    .update(password + salt)
    .digest('hex');
  return hash;
}

/**
 * 验证密码是否匹配
 * @param inputPassword 用户输入的密码
 * @param hashedPassword 存储的哈希密码
 * @param salt 盐值
 * @returns 密码是否匹配
 */
export function verifyPassword(inputPassword: string, hashedPassword: string, salt: string): boolean {
  const inputHash = hashPassword(inputPassword, salt);
  return inputHash === hashedPassword;
}