const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack

    res.status(err.statusCode || 500).json({
        sucess: false,
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}


module.exports = errorHandler;