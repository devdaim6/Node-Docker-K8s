const errorBoundary = (fn) => {
	return async (req, res, next) => {
		try {
			await fn(req, res, next);
		} catch (error) {
			console.error('Error caught by errorBoundary:', error);
			res.status(500).json({
				error: 'An unexpected error occurred',
				message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message
			});
		}
	};
};

module.exports = errorBoundary;
