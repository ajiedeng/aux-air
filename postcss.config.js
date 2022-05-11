module.exports = function px2vwConfig() {
    //
    return {
        unitToConvert: 'px',
        viewportWidth: 375,
        unitPrecision: 5,
        propList: ['*'],
        viewportUnit: 'vw',
        fontViewportUnit: 'vw',
        selectorBlackList: [],
        minPixelValue: 1,
        mediaQuery: false,
        replace: true,
        exclude: [/node_modules/,/src\\common\\components\\libs\\/],
        landscape: false,
        landscapeUnit: 'vw',
        landscapeWidth: 568
    }
}