// for render urls
const isAuth = (req, res, next) => {
	if (req.session.isAuth) {
		next();
	} else {
		res.redirect('/');
	}
}

// for api calls
const isApiCallValid = (req, res, next) => {
	if (req.session.isAuth) {
		next();
	} else {
		const response = {
			success: false,
			msg: 'not authorized'
		};
		res.json(JSON.stringify(response));
	}
}

const isNotAuth = (req, res, next) => {
	if (req.session.isAuth) {
		res.redirect('/home');
	} else {
		next();
	}
}

module.exports = { isAuth, isApiCallValid, isNotAuth };