module.exports = function reducer (prev_state,action) {
  if (typeof prev_state === 'undefined') {
    return (
      {
        id: false,
        name: false
      }
    );
  }
  switch (action.type) {
    case 'SET_ID_N_Name': 
      return (
        {
          ...prev_state,
          id: action.amount.id,
          name: action.amount.name
        }
      );
      break; 
    case 'NULL_ID_N_NAME': 
      return (
        {
          ...prev_state,
          id: false,
          name: false
        }
      );
      break;
    default:
      return (
        {
          id: prev_state.id,
          name: prev_state.name
        }
      );
  }
}