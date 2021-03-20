
const addToList = (myList, myObject) => {
  var index = myList.findIndex(x => x.key === myObject.key);

  if(index === -1){
    myList.push(myObject);
    return 1;
  }

  myList.splice(index, 1, myObject);
};

const isInList = (myList, key) => {
  var index = myList.findIndex(x => x.key === key);
  if(index === -1){
    return false;
  }
  return true;
};

const removeToList = (myList, key) => {
  var index = myList.findIndex(x => x.key === key);

  if(index === -1){
    return 1;
  }

  myList.splice(index, 1);
};



export {addToList, isInList, removeToList };
