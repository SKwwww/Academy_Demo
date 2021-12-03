module.exports = function setnIdnName (id,name) {
  const amount = {
    id: id,
    name: name
  }
  return (
    {
      type: 'SET_ID_N_Name',
      amount: amount
    }
  );
}