﻿
guidedModel =// @startlock
{
	Task :
	{
		events :
		{
			onValidate:function()
			{// @endlock
				var result = {error: 0};
				
				if (this.description.length == 0)
					result = {error: 101, errorMessage: 'Task has no description'};
					
				else if (this.taskDate.toLocaleDateString() != new Date().toLocaleDateString())
					result = {error: 102, errorMessage: 'Task has invalid date'};
					
				else if ((this.taskType != 'Appointment') && (this.taskType != "Event"))
					result = {error: 103, errorMessage: 'Task has invalid type'};
					
				else if ((this.taskStatus != 'Unconfirmed') && (this.taskStatus != 'Confirmed'))
					result = {error: 104, errorMessage: 'Task has invalid status'};
				
				return result;
			},// @startlock
			onInit:function()
			{// @endlock
				this.description = '';
				this.taskType = 'Appointment';
				this.taskStatus = 'Unconfirmed';
				this.taskDate = new Date();
			}// @startlock
		}
	},
	Person :
	{
		events :
		{
			onInit:function()
			{// @endlock
				this.firstName = '';
				this.lastName = '';
				this.streetNumber = 0;
				this.streetName = '';
			}// @startlock
		},
		collectionMethods :
		{// @endlock
			changeAttribute:function(attributeName, value)
			{// @lock
				var result = true;
				ds.startTransaction();
				try
				{
					this.forEach(function(thePerson)
					{
						thePerson[attributeName] = value;
					});
					ds.commit();
				}
				catch (e)
				{
					ds.rollBack();
					result = false;
				}
				
				return result;
			}// @startlock
		},
		address :
		{
			onQuery:function(compOperator, valueToCompare)
			{// @endlock
				
				var result = '';
				var addressParts = valueToCompare.split(' ');
				var numPart = 0;
				var namePart = '';
				if (addressParts.length > 0)
				{
					numPart = Number(addressParts[0]);
					if ((numPart == null) || (numPart.toString() != addressParts[0])) //so was all digits
					{
						numPart = 0;
						namePart = valueToCompare;
					}
					else
					{
						addressParts.shift();
						namePart = addressParts.join(' ');
					}
				}
				if ((numPart != 0) || (namePart.length > 0))
				{
					if (numPart == 0) //no street number was supplied
						result = 'streetName ' + compOperator + '"' + namePart + '"';
					else if (namePart.length == 0)
						result = 'streetNumber ' + compOperator + '"' + numPart + '"';
					else { 	//both street number and name were supplied
						switch (compOperator) {
							case '==':
							case '===':
								result = 'streetNumber ' + compOperator + '"' + numPart + '"';
								result += ' and streetName ' + compOperator + '"' + namePart + '"';
								break;
							case '!=': 	//since no 'break' runs next case
							case '!==':
									/* could use this but not as fast
									result = "(firstName "+ compOperator +"'"+fname+"'";
									result += "and lastName "+ compOperator +"'"+lname+"')";
									instead use the code below */
								result = 'not (';
								result += 'streetNumber '+compOperator.substr(1) + '"' + numPart + '"';
								result += 'and streetName '+compOperator.substr(1) + '"' + namePart + '")';
								break;
							case '>': 		//all 4 handled in the case below
							case '>=': 
							case '<': 
							case '<=': 
								var compOper2 = compOperator[0]; // get the first char
								result = '(streetName = "' + namePart + '" and streetNumber ' 
								result += compOperator + '"' + numPart + '")';
								result += 'or (streetName ' + compOper2 + '"' + namePart + '")';
								break;
						}	 
					} 	
				}
				return result;
				
			},// @startlock
			onSort:function(ascending)
			{// @endlock
				if (ascending)
					return 'streetName, streetNumber';
				else
					return 'streetName desc, streetNumber desc';
			},// @startlock
			onSet:function(value)
			{// @endlock
				var addressParts = value.split(' ');
				var numPart = 0;
				var namePart = '';
				if (addressParts.length > 0)
				{
					numPart = Number(addressParts[0]);
					if ((numPart == null) || (numPart.toString() != addressParts[0])) //so was all digits
					{
						numPart = 0;
						namePart = value;
					}
					else
					{
						addressParts.shift();
						namePart = addressParts.join(' ');
					}
				}
				this.streetNumber = numPart;
				this.streetName = namePart;
			},// @startlock
			onGet:function()
			{// @endlock
				if ((this.streetNumber != null) & (this.streetNumber > 0))
					return this.streetNumber + ' ' + this.streetName;
				else
					return this.streetName;
			}// @startlock
		},
		fullName :
		{
			onSort:function(ascending)
			{// @endlock
				if (ascending)
					return 'lastName, firstName';
				else
					return 'lastName desc, firstName desc';
			},// @startlock
			onQuery:function(compOperator, valueToCompare)
			{// @endlock
				var result = null;
				var pieces = valueToCompare.split(' ');	 //break into array
				var fname = pieces[0];
				var lname = ''; //not sure they provided a full name
				if (pieces.length > 1) 	//so check
				{
					pieces.shift();//get rid of the first element
					lname = pieces.join(" "); // last name is all the rest
				}
				if (lname == '') { 	//only one piece was supplied
					if (compOperator == '==') {  	//we'll take to mean special case
					   //indicating very broad query
						result = '(firstName == "' + fname + '"';
						result += ' or lastName == "' + fname + '")';
					} 	//if
					else  	//we'll take this to mean comparison to lastName
						result = 'lastName ' + compOperator + '"' + fname + '"';
				}
				else { 	//two pieces were supplied
					switch (compOperator) {
						case '=': 		//since no 'break' runs next case
						case '==':
						case '===':
							result = 'firstName ' + compOperator + '"'+ fname + '"';
							result += ' and lastName ' + compOperator +'"'+lname + '"';
							break;
						case '!=': 	//since no 'break' runs next case
						case '!==':
								/* could use this but not as fast
								result = "(firstName "+ compOperator +"'"+fname+"'";
								result += "and lastName "+ compOperator +"'"+lname+"')";
								instead use the code below */
							result = 'not (';
							result += 'firstName '+compOperator.substr(1)+ '"'+fname+'"';
							result += 'and lastName '+compOperator.substr(1)+ '"'+lname+'")';
							break;
						case '>': 		//all 4 handled in the case below
						case '>=': 
						case '<': 
						case '<=': 
							var compOper2 = compOperator[0]; // get the first char
							result = '(lastName = "' + lname + '" and firstName ' 
							result += compOperator + '"' + fname + '")';
							result += 'or (lastName ' + compOper2 + '"' + lname+ '")';
							break;
					}	 //switch
				} 	//else
				return result;

			},// @startlock
			onSet:function(value)
			{// @endlock
				var nameParts = value.split(' ');
				if (nameParts.length > 1)
				{
					this.firstName = nameParts[0];
					nameParts.shift();
					this.lastName = nameParts.join(' ');
				}
				else
				{
					this.firstName = '';
					this.lastName = value;
				}
			},// @startlock
			onGet:function()
			{// @endlock
				return this.firstName + ' ' + this.lastName;
			}// @startlock
		},
		methods :
		{// @endlock
			importPeople:function()
			{// @lock
				var folder = ds.getModelFolder();
				if (folder != null)
				{
					var thePath = folder.path;
					var baseFolder = thePath + 'ImportData/';
					var file = File(baseFolder + 'NamesAddressesNumbers.txt');

					if (ds.Person.length == 0)
					{
						var input = TextStream(file,'read');
						if (!input.end())
						{
							var record = input.read('\r');
							if (record == 'First\tLast\tAddress\tCity\tState\tZip\tPhone') //verify that the file is in the right format
							{
								while (!input.end())
								{
									record = input.read("\r"); //read one row
									if (record != "")
									{
										var columnArray = record.split('\t');
										if (columnArray.length == 7)
										{
											var addressParts = columnArray[2].split(' ');
											var numPart = 0;
											var namePart = '';
											if (addressParts.length > 0)
											{
												numPart = Number(addressParts[0]);
												if ((numPart == null) || (numPart.toString() != addressParts[0])) //so was all digits
												{
													numPart = 0;
													namePart = columnArray[2];
												}
												else
												{
													addressParts.shift();
													namePart = addressParts.join(' ');
												}
											}
											
											var newPerson = new ds.Person({
												firstName: columnArray[0].replace(/['"]/g,''),
												lastName: columnArray[1].replace(/['"]/g,''),
												streetNumber: numPart,
												streetName: namePart,
												city: columnArray[3],
												state: columnArray[4],
												zip: columnArray[5],
												homePhone: columnArray[6]
												});
											if (newPerson.lastName != '?')
												newPerson.save();
										}
									}
								}
							}
						}	
					}
				}
			}// @startlock
		}
	}
};// @endlock