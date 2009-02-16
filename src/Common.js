function unless( stmt, func ) {
    if( ! stmt ) { func(); }
}

Array.prototype.contains = function(substring) {
    return this.indexOf(substring) > -1;
};

