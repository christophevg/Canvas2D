function unless( stmt, func ) {
    if( ! stmt ) { func(); }
}

function max(a,b) {
    return a < b ? b : a;
}

function min(a,b) {
    return a < b ? a : b;
}

Array.prototype.contains = function(substring) {
    return this.indexOf(substring) > -1;
};

