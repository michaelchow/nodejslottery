var MyUtil = exports = module.exports = {};

MyUtil.isEmpty = function (obj) {
    for (var name in obj)
    {
        return false;
    }
    return true;
};

MyUtil.zeroFill = function (str, len) {
	
	for (var i = str.toString().length; i < len; i++)
	{
		str = "0" + str;
	}
    return str;
};