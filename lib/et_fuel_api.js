/**
 * Created by steves on 06/23/15.
 * Updated on 02/14/17
 */
var Q = require("q");

// Need to use my version for enhanced features
var FuelSoap = require('fuel-soap');

var configPath = "../config/fuelsdk";

var fuelSDKConfig = require(configPath);
console.log("fuelSDKConfig",fuelSDKConfig);

// SoapClient = new FuelSoap(options);
SoapClient = new FuelSoap(fuelSDKConfig.options);
//console.log("SoapClient",SoapClient);


/////////////////////////////////////////////////////////////////////////////
// EtFuelApi API Calls
/////////////////////////////////////////////////////////////////////////////

var EtFuelApi = function () {
    console.log("::et_fuel_api::");

    // TODO: need to find a better way to track / store for continueRequest retrieves
    this.retrieveDEResponseBodyResults = [];
};


/////////////////////////////////////////////////////////////////////////////
// Queries
/////////////////////////////////////////////////////////////////////////////

//
// https://help.marketingcloud.com/en/documentation/exacttarget/interactions/activities/query_activity/
// https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/supported_operations_for_objects_and_methods.htm?search_text=querydefinition
//

//
// Create Query
//
//
//
//
EtFuelApi.prototype.createQuery = function () {
    console.log("::et_fuel_api:: createQuery:");

    var deferred = Q.defer();

    // Query
    QueryName = "{Name of Query}";
    QueryText = "{Enter your query here}";
    QueryTargetType = "DE";
    TargetUpdateType = "Overwrite"; // Append / Update

    //
    // Note: I found that you need to pass the DE in order
    // for the Query to be updated
    //

    // Data Extension
    DECustomerKey = "{DE Customer Key}";
    DEName = "{DE Name}";

    var objects = {
        // CustomerKey: QueryCustomerKey,
        Name: QueryName,
        Description: "{Description here}",
        QueryText: QueryText,
        TargetType: QueryTargetType,
        TargetUpdateType: TargetUpdateType,
        DataExtensionTarget: {
            CustomerKey: DECustomerKey,
            Name: DEName
        }
    };
    //console.log("List objects: ",objects);

    SoapClient.create(
        'QueryDefinition',
        objects,
        function (err, response) {
            if (err) {
                // error here
                console.error(err);
                return;
            }

            console.log(response.body.Results);

            deferred.resolve(response.body);
        }
    );


    return deferred.promise;
};

//
// Retrieve Query
//
EtFuelApi.prototype.retrieveQuery = function () {
    console.log("::et_fuel_api:: retrieveQuery:");

    var deferred = Q.defer();

    var CustomerKey = "{Customer Key}";
    console.log("CustomerKey", CustomerKey);

    var props = [
        "Name",
        "ObjectID",
        "CustomerKey",
        "Description",
        "QueryText",
        "TargetType",
        "TargetUpdateType",
        "CategoryID",
        "Status",
        "DataExtensionTarget.CustomerKey"
    ];


    // InteractionBaseObject ibo = new InteractionBaseObject();
    // ibo.CustomerKey = strTargetGUID;//The DE to dump results to
    // ibo.Name = strDEQuery;

    var options = {
        filter: {
            leftOperand: 'CustomerKey',
            operator: 'equals',
            rightOperand: CustomerKey
        }
    };

    SoapClient.retrieve(
        'QueryDefinition',
        props,
        options,
        function( err, response ) {
            if ( err ) {
                // error here
                console.error( err );
                return;
            }
            // console.log(response.body);

            deferred.resolve(response.body);
        }
    );

    return deferred.promise;
};

//
// Update Query
//
// updateObj: {
//      ObjectID = Query ObjectID
//      DataExtensionTargetCK = Data Extension Customer Key
// }
//
EtFuelApi.prototype.updateQuery = function (updateObj) {
    console.log("::et_fuel_api:: updateQuery:");

    var deferred = Q.defer();

    //
    // Note: updateQuery uses the Query ObjectID and NOT the CustomerKey
    //

    // http://nickholdren.com/2011/03/07/update-a-query-activity-in-exacttarget-via-soap-api-in-exacttarget/
    // https://developer.salesforce.com/docs/atlas.en-us.mc-apis.meta/mc-apis/updating_a_query_activity.htm
    // https://github.com/salesforce-marketingcloud/FuelSDK-Ruby/issues/8
    // http://salesforce.stackexchange.com/questions/67540/how-to-start-a-query-activity-using-the-api-dotnet

    var QueryText = "Your Query here - pass any extra variables through the method param to concatenate";
    // console.log("QueryText", QueryText);

    var props = {
        // "Name": "",
        // "Description": "",
        "ObjectID": updateObj.ObjectID,
        // "CustomerKey": CustomerKey - DONT USE THIS!!!
        "QueryText": QueryText,
        "DataExtensionTarget": {
            "CustomerKey": updateObj.DataExtensionTargetCK
        }
    };
    // console.log("props", props);

    var options = null;

    SoapClient.update(
        'QueryDefinition',
        props,
        options,
        function( err, response ) {
            if ( err ) {
                // error here
                console.error( err );
                return;
            }
            // console.log(response.body);

            deferred.resolve(response.body);
        }
    );

    return deferred.promise;
};


/////////////////////////////////////////////////////////////////////////////
// Automation Studio Activities
/////////////////////////////////////////////////////////////////////////////

// The Status property can contain the following values:
//
// Code	Status Type	Message
// -1	Error	Program errored out
// 0	BuildingError	Program errored out during building
// 1	Building	Program building with activities, schedules, and other elements
// 2	Ready	Program ready to start
// 3	Running	Program running
// 4	Paused	Program paused from running state
// 5	Stopped	Program stopped
// 6	Scheduled	Program scheduled
// 7	Awaiting Trigger	Program waiting for a trigger
// 8	InactiveTrigger	Program trigger inactive
//

//
// Automation Activity
//
EtFuelApi.prototype.startAutomationActivity = function () {
    console.log("::et_fuel_api:: startAutomationActivity:");

    var deferred = Q.defer();

    // CustomerKey for activity in Automation Studio
    propObj = {
        'CustomerKey': "{Customer Key}"
    };
    // console.log("propObj", propObj);

    // local = this before callback assignment
    SoapClient.perform(
        'Automation',
        propObj,
        function( err, response ) {
            if ( err ) {
                // error here
                console.error( err );
                console.error( err.results );
                console.error( err.results[0].Result.Object );
                console.error( err.results[0].Result.Task );
                return;
            }
            // console.log(response.body);

            deferred.resolve(response.body);
        }
    );

    return deferred.promise;
};

//
// Retrieve Activity
//
EtFuelApi.prototype.retrieveActivity = function (soapClient) {
    // console.log("::et_fuel_api:: retrieveActivity:");

    var deferred = Q.defer();

    var CustomerKey = "{Customer Key}";
    // console.log("CustomerKey", CustomerKey);

    var props = [
        "CustomerKey",
        "Description",
        "Name",
        "Status",
        // "ProgramID"
    ];

    var options = {
        filter: {
            leftOperand: 'CustomerKey',
            operator: 'equals',
            rightOperand: CustomerKey
        }
    };

    soapClient.retrieve(
    // SoapClient.retrieve(
        'Automation',
        props,
        options,
        function( err, response ) {
            if ( err ) {
                // error here
                console.error( err );
                return;
            }
            // console.log(response.body);

            deferred.resolve(response.body);
        }
    );

    return deferred.promise;
};

//
// Loop Retrieve Activity
//
// This method checks the Automation Studio activity for its status
// and responses accordingly.
//
EtFuelApi.prototype.LoopRetrieveActivity = function (etFuelApiInstance) {
    console.log(":LoopRetrieveActivity:");

    var deferred = Q.defer();

    var SoapClient = etFuelApiInstance.SoapClient;

    etFuelApiInstance.retrieveActivity(SoapClient)
        .then(function (response) {
            // console.log(":retrieveActivity: response", response);

            if (response.OverallStatus == "OK") {
                // console.log("response", response);

                var status = parseInt(response.Results[0].Status);
                console.log("status", status);

                var str = "";

                // Switch / Case continues to run and loop the
                // LoopRetrieveActivity() method until it gets a
                // Success or Error
                // Then, we pass the response back to the original promise in app.js
                switch (status) {
                    case -1:
                        str = "-1 Error: Program erred out";
                        // console.err(str);
                        deferred.resolve({"error": str});
                        break;
                    case 0:
                        str = "0 BuildingError: Program erred out during building";
                        // console.err(str);
                        deferred.resolve({"error": str});
                        break;
                    case 1:
                        str = "1 Building: Program building with activities, schedules, and other elements";
                        // console.err(str);
                        deferred.resolve({"error": str});
                        break;
                    case 2:
                        str = "2 Ready: Program ready to start";
                        // console.log(str);
                        deferred.resolve({"success": str});
                        break;
                    case 3:
                        str = "3 Running: Program running";
                        // console.log(str);
                        return etFuelApiInstance.LoopRetrieveActivity(etFuelApiInstance);
                        break;
                    case 4:
                        str = "4 Paused: Program paused from running state";
                        // console.log(str);
                        return etFuelApiInstance.LoopRetrieveActivity(etFuelApiInstance);
                        break;
                    case 5:
                        str = "5 Stopped: Program stopped";
                        // console.log(str);
                        deferred.resolve({"error": str});
                        break;
                    case 6:
                        str = "6 Scheduled: Program scheduled";
                        // console.log(str);
                        return etFuelApiInstance.LoopRetrieveActivity(etFuelApiInstance);
                        break;
                    case 7:
                        str = "7 Awaiting Trigger: Program waiting for a trigger";
                        // console.log(str);
                        return etFuelApiInstance.LoopRetrieveActivity(etFuelApiInstance);
                        break;
                    case 8:
                        str = "8 InactiveTrigger: Program trigger inactive";
                        // console.log(str);
                        deferred.resolve({"error": str});
                        break;
                }

            } else {
                console.err(response);
            }

    }).then(function (response) {
        // console.log(":Switch/Case retrieveActivity: response", response);

        deferred.resolve(response);

    }).catch(function (err) {
        console.error(err);
    });

    return deferred.promise;
};


/////////////////////////////////////////////////////////////////////////////
// Data Extensions
/////////////////////////////////////////////////////////////////////////////

//
// Retrieve Data Extension
//
// Credit to: Jamie Robertson for the continueRequest add-on
// https://github.com/salesforce-marketingcloud/FuelSDK-Node-SOAP/pull/68/files
//
EtFuelApi.prototype.retrieveDataExtension = function (listID, continueRequest) {
    console.log("::et_fuel_api:: retrieveDataExtension:");

    var deferred = Q.defer();

    console.log("retrieveDataExtension:listID", listID);
    console.log("continueRequest:", continueRequest);

    var DEName = "LaunchReady";

    // DE look up is handled by passing the DE name into the Type field
    var DEObj = "DataExtensionObject" + "[" + DEName + "]";

    // var CustomerKey = "CUSTOMER KEY DIDNT WORK FOR ME!";
    // console.log("CustomerKey", CustomerKey);

    // var props = [];

    var props = [
        // "EmailAddress",
        // "ListID",
        // "ListName",
        // "ListType",
        // "Status",
        // "SubscriberID",
        "SubscriberKey"
        // "SubscriberType",
        // "AddedBy",
        // "AddMethod",
        // "CreatedDate",
        // "DateUnsubscribed"
    ];

    var options = {
        filter: {
            leftOperand: 'ListID',
            operator: 'equals',
            rightOperand: listID
        }
    };

    if (continueRequest) {
        options.continueRequest = continueRequest;
    } else {
        EtFuelApi.retrieveDEResponseBodyResults = [];
    }

    SoapClient.retrieve(
        DEObj,
        props,
        options,
        function (err, response) {
            if (err) {
                console.error("::et_fuel_api:: retrieveDataExtension:", err);
                return;
            }

            console.log("::et_fuel_api:: retrieveDataExtension: response.body.OverallStatus", response.body.OverallStatus);

            if (response.body.OverallStatus === 'MoreDataAvailable') {
                // console.log("::et_fuel_api:: retrieveDataExtension: MoreDataAvailable", response.body.Results);

                EtFuelApi.retrieveDEResponseBodyResults.push(response.body.Results[0]);
                console.log("MDA responseBodyResults", EtFuelApi.retrieveDEResponseBodyResults.length);

                // Run the retrieveDataExtension again to get more results
                EtFuelApi.prototype.retrieveDataExtension(listID, response.body.RequestID);

            } else if (response.body.OverallStatus === 'OK') {

                console.log("::et_fuel_api:: retrieveDataExtension:", response.body.Results);

                EtFuelApi.retrieveDEResponseBodyResults.push(response.body.Results[0]);
                console.log("OK responseBodyResults", EtFuelApi.retrieveDEResponseBodyResults.length);

                deferred.resolve(EtFuelApi.retrieveDEResponseBodyResults);

            } else {
                console.log('Unexpected OverallStatus value in response: ', response.body.OverallStatus);
            }
        }
        //
        // Previous apprach
        //
        // function( err, response ) {
        //     if ( err ) {
        //         // error here
        //         console.error("::et_fuel_api:: retrieveDataExtension:", err);
        //         return;
        //     }
        //     // console.log("::et_fuel_api:: retrieveDataExtension:", response);
        //     console.log("::et_fuel_api:: retrieveDataExtension: OverallStatus:", response.body.OverallStatus);
        //     // console.log("::et_fuel_api:: retrieveDataExtension:", response.body);
        //
        //     if (continueRequest) {
        //         options.continueRequest = continueRequest;
        //
        //     }
        //     // deferred.resolve(response.body);
        // }
    );

    return deferred.promise;
};


/////////////////////////////////////////////////////////////////////////////
// Lists
/////////////////////////////////////////////////////////////////////////////

//
// Create List
//
// listObj: {
//      listName
//      folderID
// }
//
EtFuelApi.prototype.createList = function ( listObj ) {
    console.log("::et_fuel_api:: createList:");
    //console.log("listObj:",listObj);

    var deferred = Q.defer();

    //
    // Cap the length to 36 char for later use
    // Imp Def only allow 36 char
    //

    var objects = {
        ListName: listObj.listName,
        Description: listObj.listName,
        Type: "Private",
        Category: listObj.folderID
    };
    //console.log("List objects: ",objects);

    SoapClient.create(
        'List',
        objects,
        function (err, response) {
            if (err) {
                // error here
                console.error(err);
                return;
            }

            //console.log(response.body.Results);
            //console.log(response.body.Results.length);

            // Make sure we get results back
            if (response.body.Results.length) {
                //console.log(response.body.Results);

                deferred.resolve(response.body);
            }
        }
    );

    return deferred.promise;
};

//
// Retrieve List
//
EtFuelApi.prototype.retrieveList = function (ListID, GetListName) {
    console.log("::et_fuel_api:: retrieveList:");

    var deferred = Q.defer();

    console.log("ListID", ListID);
    console.log("GetListName", GetListName);

    if (GetListName) {
        var props = [
            "ID",
            "ListName"
            // "Description",
            // "Category",
            // "Type",
            // "CreatedDate",
            // "ModifiedDate",
            // "CustomerKey"
        ];

        var options = {
            filter: {
                leftOperand: 'ID',
                operator: 'equals',
                rightOperand: ListID
            }
        };

        SoapClient.retrieve(
            'List',
            props,
            options,
            function( err, response ) {
                if ( err ) {
                    // error here
                    console.error( err );
                    return;
                }
                // console.log("response", response);
                // console.log("response.body", response.body);

                deferred.resolve(response.body);
            }
        );
    } else if (GetListName == false) {
        console.warn("Skipping the retrieveList method");
        // response.OverallStatus = GetListName;
        deferred.resolve(GetListName);
    }

    return deferred.promise;
};

//
// Retrieve SubscriberList
//
EtFuelApi.prototype.retrieveSubscriberList = function (ListID) {
    console.log("::et_fuel_api:: retrieveSubscriberList:");

    var deferred = Q.defer();

    console.log("retrieveSubscriberList ListID", ListID);

    var props = [
        // "ID",
        // "List.ListName",
        // "List.ID",
        // "Status",
        // "Subscriber.EmailAddress",
        "Subscriber.SubscriberKey"
    ];

    var options = {
        filter: {
            leftOperand: 'List.ID',
            operator: 'equals',
            rightOperand: ListID
        }
        // BatchSize: 2
    };

    SoapClient.retrieve(
        'SubscriberList',
        props,
        options,
        function( err, response ) {
            if ( err ) {
                // error here
                console.error( err );
                return;
            }
            // console.log(response);
            // console.log(response.body);
            deferred.resolve(response.body);
        }
    );

    return deferred.promise;
};

//
// Retrieve ListSubscribers
//
EtFuelApi.prototype.retrieveListSubscribers = function (ListID) {
    console.log("::et_fuel_api:: retrieveListSubscribers:");

    var deferred = Q.defer();

    console.log("retrieveListSubscribers ListID", ListID);

    // getListSubs.props = [
    //      "ObjectID",
    //      "SubscriberKey",
    //      "CreatedDate",
    //      "Client.ID",
    //      "Client.PartnerClientKey",
    //      "ListID",
    //      "Status"
    // ]
    // getListSubs.search_filter = {
    //      'Property' : 'ListID',
    //      'SimpleOperator' : 'equals',
    //      'Value' : newListID
    // }

    var props = [
         // "ObjectID",
         "SubscriberKey",
         "CreatedDate",
         // "Client.ID",
         // "Client.PartnerClientKey",
         "ListID",
         "Status"
    ];

    var options = {
        filter: {
            leftOperand: 'ListID',
            operator: 'equals',
            rightOperand: ListID
        }
    };

    SoapClient.retrieve(
        'ListSubscriber',
        props,
        options,
        function( err, response ) {
            if ( err ) {
                // error here
                console.error( err );
                return;
            }
            console.log(response);

            deferred.resolve(response.body);
        }
    );

    return deferred.promise;
};


/////////////////////////////////////////////////////////////////////////////
// Subscribers
/////////////////////////////////////////////////////////////////////////////

//
// Retrieve Subscriber
//
EtFuelApi.prototype.retrieveSubscriber = function (SubscriberKeys) {
    console.log("::et_fuel_api:: retrieveSubscriber:");

    var deferred = Q.defer();

    // console.log("SubscriberKeys", SubscriberKeys);

    var props = [
        "ID",
        "SubscriberKey"
        // "Status"
    ];

    // One Subscriber Key
    if (SubscriberKeys.length == 1) {
        var options = {
            filter: {
                leftOperand: 'SubscriberKey',
                operator: 'equals',
                rightOperand: SubscriberKeys
            }
        };
        // Multiple Subscriber Keys
    } else if (SubscriberKeys.length > 1) {
        var options = {
            filter: {
                leftOperand: 'SubscriberKey',
                operator: 'IN',
                rightOperand: SubscriberKeys
            }
        };
    }


    SoapClient.retrieve(
        'Subscriber',
        props,
        options,
        function( err, response ) {
            if ( err ) {
                // error here
                console.error( err );
                return;
            }
            // console.log(response.body);
            deferred.resolve(response.body);
        }
    );

    return deferred.promise;
};


/////////////////////////////////////////////////////////////////////////////
// Import Definitions
/////////////////////////////////////////////////////////////////////////////

//
// Create Import Definition
//
// impDefObj: {
//      listID
//      listName
//      filename
// }
//
EtFuelApi.prototype.createImportDef = function ( impDefObj ) {
    console.log("::et_fuel_api:: createImportDef:");

    var deferred = Q.defer();

    console.log("impDefObj:",impDefObj);

    var listID = impDefObj.listID;

    var listNameLen = impDefObj.listName.length;

    var listDate = impDefObj.listName.substring(listNameLen-15, listNameLen);
    console.log("listDate:",listDate);

    var CustomerKey = listID + "_" + listDate;
    console.log("CustomerKey:",CustomerKey);

    var importDefName = impDefObj.listName;
    console.log("importDefName:",importDefName);

    var filename = impDefObj.filename;

    var description = "Import Definition generated via API for Fuel-Soap NodeJS";

    var status;

    var objects = {
        CustomerKey: CustomerKey,
        Name: importDefName,
        Description: description,
        AllowErrors: false,
        DestinationObject: {
            '$': {
                "xsi:type": 'List'
            },
            ID: listID
            //CustomerKey: ""
        },
        FieldMappingType: "InferFromColumnHeadings",
        FileSpec: filename,
        //FileType: "CSV",
        FileType: "Other",
        Delimiter: ";",
        Notification: {
            ResponseType: "email",
            ResponseAddress: "{response email}"
        },
        RetrieveFileTransferLocation: {
            CustomerKey: "ExactTarget Enhanced FTP"
        },
        SubscriberImportType: "Email",
        UpdateType: "AddAndUpdate"
    };

    SoapClient.create(
        'ImportDefinition',
        objects,
        function (err, response) {
            if (err) {
                // error here
                console.error("err:", err);
                //console.error(err.results);
                console.error("results:", err.results[0].Object);

                status = "error";
            }
            // console.log(response.body);

            deferred.resolve(response.body);
        }
    );

    return deferred.promise;
};

//
// Start Import Definition
//
EtFuelApi.prototype.startImportDefinition = function ( CustomerKey ) {
    console.log("::et_fuel_api:: startImportDefinition:");

    var deferred = Q.defer();

    console.log("CustomerKey", CustomerKey);

    //
    // Assigning this to local instead of this allowed for the
    // SoapClient to log out, but it still not triggering the Perform method
    //
    //console.log("assign this.callback with callback fn");

    var SoapClientCallback = function (err, response) {
        console.log("soapCbImpDef Fn");

        if (err) {
            // error here
            console.error("err:", err);
            //console.error("results", err.results);
            console.error("Results:", err.results[0].Result);
            //return;
        }

        // Pass the TaskID back through the callback
        deferred.resolve(response.body);
    };


    //
    // Let's force this to run once
    //
    //console.log("Trigger the SoapClient::Perform...");

    // local = this before callback assignment
    SoapClient.perform(
        'ImportDefinition',
        CustomerKey,
        SoapClientCallback
    );

    return deferred.promise;
};

//
// Retrieve Import Definition Status
//
EtFuelApi.prototype.retrieveImportDefStatus = function ( taskID ) {
    //console.log("::et_fuel_api:: retrieveImportDefStatus");
    //console.log("::et_fuel_api:: retrieveImportDefStatus: taskID", taskID);

    var deferred = Q.defer();

    var status = "";

    var props = [
        "ImportDefinitionCustomerKey",
        "TaskResultID",
        "ImportStatus",
        "StartDate",
        "EndDate",
        "DestinationID",
        "NumberSuccessful",
        "NumberDuplicated",
        "NumberErrors",
        "TotalRows",
        "ImportType"
    ];

    var options = {
        filter: {
            leftOperand: 'TaskResultID',
            operator: 'equals',
            rightOperand: taskID
        }
    };

    var SoapClientCallback = function (err, response) {
        if (err) {
            // error here
            console.error("err:", err);

            status = "Error";

            deferred.reject(err);
        }
        //console.log(response);

        try {
            //status = response.body.Results[0].ImportStatus;
            //console.log("Inside ImportStatus:",ImportStatus);

            deferred.resolve(response.body);

        } catch(err) {
            console.error("ImportStatus err:", err);
            console.error("ImportStatus response:", response);

            status = "Error";

            deferred.reject(err);
        }
    };

    //console.log(":retrieveImportDefStatus:SoapClient.retrieve");

    SoapClient.retrieve(
        'ImportResultsSummary',
        props,
        options,
        SoapClientCallback
    );

    return deferred.promise;
};


/////////////////////////////////////////////////////////////////////////////
// Folders
/////////////////////////////////////////////////////////////////////////////

//
// Retrieve Folders
//
// folderObj: {
//         folderName
//         ParentID
// }
//
EtFuelApi.prototype.retrieveFolder = function ( folderObj ) {
    console.log("::et_fuel_api:: retrieveFolder:");

    var deferred = Q.defer();

    var folderName = folderObj.folderName;
    var ParentID = folderObj.ParentID;
    console.log("folderObj:",folderObj);

    var props = [
        "ID",
        "Client.ID",
        "ParentFolder.ID",
        "ParentFolder.CustomerKey",
        "ParentFolder.ObjectID",
        "ParentFolder.Name",
        "ParentFolder.Description",
        "ParentFolder.ContentType",
        "ParentFolder.IsActive",
        "ParentFolder.IsEditable",
        "ParentFolder.AllowChildren",
        "Name",
        "Description",
        "ContentType",
        "IsActive",
        "IsEditable",
        "AllowChildren",
        "CreatedDate",
        "ModifiedDate",
        //"Client.ModifiedBy",
        //"ObjectID",
        "CustomerKey"
        //"Client.EnterpriseID",
        //"Client.CreatedBy"
    ];

    // Left operand for complex filter
    var leftFilter = {
        leftOperand: 'Name',
        operator: 'equals',
        rightOperand: folderName
    };

    // Right operand for complex filter
    var rightFilter = {
        leftOperand: 'ParentFolder.ID',
        operator: 'equals',
        rightOperand: ParentID
    };

    var options = {
        // Simple filter
        /*filter: {
         leftOperand: 'Name',
         operator: 'equals',
         rightOperand: ''
         }*/

        // Complete filter
        filter: {
            leftOperand: leftFilter,
            operator: 'AND',
            rightOperand: rightFilter
        }
    };

    SoapClient.retrieve(
        'DataFolder',
        props,
        options,
        function( err, response ) {
            if ( err ) {
                // error here
                console.error( err );
                return;
            }

            results = [];

            if (response.body.Results.length > 0) {
                results = response.body.Results[0];
                //console.log("Results found", response.body.Results);

                deferred.resolve(response.body);
            } else {
                console.warn("No results:", response.body);
            }
        }
    );

    return deferred.promise;
};

//
// Create Folder
//
// folderObj: {
//      Name
//      ContentType
//      ParentID
// }
//
EtFuelApi.prototype.createFolder = function ( folderObj ) {
    console.log("::et_fuel_api:: createFolder:");

    var deferred = Q.defer();

    var Name = folderObj.Name;
    var ContentType = folderObj.ContentType;
    var ParentID = folderObj.ParentID;

    var CustomerKey = Name + "_" + ParentID;

    //var ParentName = folderObj.ParentName;
    //console.log("folderObj:", folderObj);

    var objects = {
        //Client: { ID: "1081946" },
        CustomerKey: CustomerKey,
        Name: Name,
        Description: "Folder for video email " + Name,
        ContentType: ContentType,
        //PartnerKey: '',
        "ParentFolder": {
            //PartnerKey: '',
            "ID": ParentID
            //"Name": ParentName
            //ContentType: 'list',
            //IsActive: 'true',
            //IsEditable: 'true',
            //AllowChildren: 'true'
        },
        IsEditable: "true",
        AllowChildren: 'true'
    };
    // console.log("createFolder: objects:", objects);

    SoapClient.create(
        'DataFolder',
        objects,
        function (err, response) {
            if (err) {
                // error here
                console.error(err);
                return;
            }

            results = [];

            if (response.body.Results.length > 0) {
                results = response.body.Results[0];
                //console.log("Results found", response.body.Results);

                deferred.resolve(response.body);

            } else {
                console.warn("No results:", response.body);
            }
        }
    );

    return deferred.promise;
};

//
// Update Folder
//
EtFuelApi.prototype.updateFolder = function () {
    console.log("::et_fuel_api:: updateFolder:");
};


/////////////////////////////////////////////////////////////////////////////
// Sends
/////////////////////////////////////////////////////////////////////////////

//
// Create Send Email
//
// sendObj: {
//      listID
//      emailID
// }
EtFuelApi.prototype.SendEmail = function ( sendObj ) {
    console.log("::et_fuel_api:: SendEmail:");
    //console.log("sendObj:",sendObj);

    var deferred = Q.defer();

    var objects = {
        Email: {
            ID: sendObj.listID
        },
        List: {
            ID: sendObj.emailID
        }
    };
    // console.log("List objects: ",objects);

    this.SoapClient.create(
        'Send',
        objects,
        function (err, response) {
            if (err) {
                // error here
                console.error(err);
                return;
            }

            console.log(response.body.Results);
            //console.log(response.body.Results.length);

            // Make sure we get results back
            if (response.body.Results.length) {

                //console.log(response.body.Results);

                deferred.resolve(response.body);
            }
        }
    );
    return deferred.promise;
};

module.exports = new EtFuelApi();
