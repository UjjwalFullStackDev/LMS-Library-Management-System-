
function handleError(res, status, message, data, token) {
    res.status(status).json({message: message, data: data, token: token})
}

export default handleError;