// Validation functions for messages, usernames, and server names

// Check if a string contains only ASCII characters
export const isAsciiOnly = (str: string): boolean => {
	return /^[\x00-\x7F]*$/.test(str);
};

// Validate message content (80 chars max, ASCII only)
export const validateMessage = (content: string): { isValid: boolean; error?: string } => {
	if (!isAsciiOnly(content)) {
		return { isValid: false, error: 'Message can only contain ASCII characters' };
	}
	if (content.length > 80) {
		return { isValid: false, error: 'Message cannot exceed 80 characters' };
	}
	return { isValid: true };
};

// Validate username (32 chars max, ASCII only)
export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
	if (!isAsciiOnly(username)) {
		return { isValid: false, error: 'Username can only contain ASCII characters' };
	}
	if (username.length > 32) {
		return { isValid: false, error: 'Username cannot exceed 32 characters' };
	}
	return { isValid: true };
};

// Validate server/room name (32 chars max, ASCII only)
export const validateServerName = (name: string): { isValid: boolean; error?: string } => {
	if (!isAsciiOnly(name)) {
		return { isValid: false, error: 'Server name can only contain ASCII characters' };
	}
	if (name.length > 32) {
		return { isValid: false, error: 'Server name cannot exceed 32 characters' };
	}
	return { isValid: true };
};
