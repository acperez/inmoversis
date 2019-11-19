var config = module.exports = {};

/* Versions */
config.services = {
	'GetKycStatus': '1.5',
	'GetWalletDetails': '2.0',
	'UpdateWalletDetails': '1.0',
	'UploadFile': '1.1'
}

config.createWalletTimeout = 72 * 60 * 60;

/* Wallet status */
config.walletStatusDefault = '5';
config.walletStatus = {
	'2': 'registered, KYC incomplete',
	'3': 'registered, rejected KYC',
	'5': 'registered, KYC 1 (status given at registration)',
	'6': 'registered, KYC 2',
	'7': 'registered, KYC 3',
	'8': 'registered, expired KYC',
	'9': 'blocked',
	'12': 'closed',
	'13': 'registered, status is being updated from KYC 2 to KYC 3',
	'14': 'one-time customer',
	'15': 'Special wallet for crowdlending'
};

/* KYC status */
config.docStatusDefault = '1';
config.docStatus = {
	'0':'Document put on hold, waiting for another document',
	'1':'Not verified yet (default status after upload)',
	'2':'Accepted',
	'3':'Not accepted',
	'4':'Replaced with another document',
	'5':'Expired',
	'6':'Wrong type',
	'7':'Wrong name'
};
