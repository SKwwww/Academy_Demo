module.exports = class ClassWithStore  {
  constructor (reducer,init_state) {
    if(typeof init_state === 'undefined') {
      this.state = reducer();
    }  else {
      this.state = init_state;
    }
    this.reducer = reducer;
    this.onStateChange = function(){};
  }
  dispatch (action) {
    if (typeof(action)=="object") {
      this.state = this.reducer(this.state,action);
      this.onStateChange(this.state);
    }
    if (typeof(action)=="function") {
      action(this.dispatch, this.getState,this);
    }
  }
  subscribe (func) {
     this.onStateChange = func;
  }
  getState () {
    return this.state;
  }
}