/**
 * Created by steves on 2/14/17.
 */
var fuelSDKConfig = function() {
    "strict mode";

    console.log("::fuelsdkConfig::");

    this.options = {
        auth: {
            clientId: '{Your ClientID here}',
            clientSecret: '{Your Client Secret here}'
        },
        soapEndpoint: '{ETs soap endpoint here}'
    };
};

module.exports = new fuelSDKConfig();