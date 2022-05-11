/*
* params:[..]    =>  {
*                       key:value
* vals:[..]      =>  }
* */
export const combine = function ({params=[],vals=[]}) {
    if(Array.isArray(params) && Array.isArray(vals)){
        const result = {};
        params.forEach(function (v,i) {
            result[v] = vals[i][0].val;
        });
        return result;
    }else{
        console.error('_combine error !');
        return {};
    }

};

/*
*{            => params:[..]
* key:value
* }           => vals:[..]
* */
export const split = function (status={}) {
    const  params =[],vals =[];

    let keys =   Object.keys(status);
    for (let i = 0; i <keys.length; ++ i) {
        params.push(keys[i]);
        vals.push([{'val':status[keys[i]],'idx':1}]);
    }

    return {params,vals};
};


export const isFunction = function (func) {
    return  Object.prototype.toString.call(func).slice(8, -1) ==='Function';
};