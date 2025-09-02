/**
 * Extract first name from a full name
 * @param fullName - The full name string (e.g., "John Doe")
 * @returns The first name (e.g., "John")
 */
export function getFirstName(fullName: string | null | undefined): string {
  if (!fullName || fullName.trim() === '') {
    return 'User'
  }
  
  return fullName.trim().split(' ')[0]
}

/**
 * Extract first name with fallback to email username
 * @param name - The full name string
 * @param email - Email address as fallback
 * @returns The first name or email username
 */
export function getFirstNameOrEmail(name: string | null | undefined, email: string | null | undefined): string {
  if (name && name.trim() !== '') {
    return getFirstName(name)
  }
  
  if (email) {
    // Extract username part from email (e.g., "john.doe@example.com" -> "john.doe")
    const emailUsername = email.split('@')[0]
    // If it contains dots, take the first part (e.g., "john.doe" -> "john")
    return emailUsername.split('.')[0] || 'User'
  }
  
  return 'User'
}