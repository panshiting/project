$(function(){
// 千分位算法
function toThousands(num) {
    var num = (num || 0).toString(), result = '';
    while (num.length > 3) {
        result = ',' + num.slice(-3) + result;
        num = num.slice(0, num.length - 3);
    }
    if (num) { result = num + result; }
    return result;
};
// 获取当前日期时间
function getCurrentDate(){
    var _curDate = new Date();
    var _y = _curDate.getFullYear(),
        _m = _curDate.getMonth()+1,
        _d = _curDate.getDate(),
        _h = _curDate.getHours()<10 ? '0'+_curDate.getHours():_curDate.getHours(),
        _min = _curDate.getMinutes()<10 ? '0'+_curDate.getMinutes():_curDate.getMinutes(),
        _sec = _curDate.getSeconds()<10 ? '0'+_curDate.getSeconds():_curDate.getSeconds();
    return _y+'年'+_m+'月'+_d+'日 '+_h+':'+_min+':'+_sec;
};
$("#cur_date").text( getCurrentDate() );
// 当前行政id
var city_id = '';
// 公用方法
var commonFn = {
    /*接口1 今年取码情况和各项目类型取码情况
    参数city代表城市行政id*/
    qmqkfn:function(city){
        $.get('/js/data.json', function (data) {
            var qm_html = "",
                tz_html = "";
            var qm_str = toThousands(data.qmqk.totalNum),
                tz_str = toThousands(data.qmqk.amount),
                sp_str = toThousands(data.typeqk.sp),
                hz_str = toThousands(data.typeqk.hz),
                bak_str = toThousands(data.typeqk.bak);
            if (data) {
                // 取码总数
                for(var i=0; i<qm_str.length; i++){
                    if ( isNaN(qm_str[i]) ){
                        qm_html += '<em>'+qm_str[i]+'</em>'; 
                    }else{
                        qm_html += '<span>'+qm_str[i]+'</span>'; 
                    }
                }
                $("#qm_sum").html(qm_html+'<em>个</em>');
                // 总投资额
                for(var i=0; i<tz_str.length; i++){
                    if ( isNaN(tz_str[i]) ){
                        tz_html += '<em>'+tz_str[i]+'</em>'; 
                    }else{
                        tz_html += '<span>'+tz_str[i]+'</span>'; 
                    }
                }
                $("#tz_sum").html(tz_html+'<em>亿元</em>');
                // 审批
                $("#sp_num").html(sp_str+'<em>个</em>');
                // 核准
                $("#hz_num").html(hz_str+'<em>个</em>');
                // 备案
                $("#bak_num").html(bak_str+'<em>个</em>');
            }
        });
    },
    // 广东省地图数据
    mapFn:function(){
        $.get('/js/guangdong.json', function (geoJson) {
            var myChart = echarts.init(document.getElementById("gd_map"));
            echarts.registerMap('guangdong', geoJson);
            // 接口2
            $.get('/js/data2.json', function (data) {
                var _data = null;
                var convertData = function (opt) {
                    var res = [],geoCoord;
                    for (var i = 0; i < opt.length; i++) {
                        for (var j = 0; j < geoJson.features.length; j++) {
                            if (geoJson.features[j].properties.id==opt[i].id) {
                                geoCoord = geoJson.features[j].properties.cp;
                                geoCoord = geoCoord.concat(opt[i].value);
                                geoCoord = geoCoord.concat(opt[i].name);
                                res.push(geoCoord);
                            }
                        }
                    }
                    return res;
                };
                if (data.cities.length>0) {
                    _data = data.cities;
                    var option = {
                        visualMap: {
                            type:'piecewise',
                            pieces:[
                                {min:800,label:'800个以上',color:'#1f2d5a',symbol:'rect'},
                                {min:641,max:800,label:'641-800个',color:'#243468',symbol:'rect'},
                                {min:481,max:640,label:'481-640个',color:'#2b3b76',symbol:'rect'},
                                {min:321,max:480,label:'321-480个',color:'#34478c',symbol:'rect'},
                                {min:161,max:320,label:'161-320个',color:'#3a4f9e',symbol:'rect'},
                                {min:0,max:160,label:'0-160个',color:'#4159af',symbol:'rect'}
                            ],
                            itemGap:0,
                            itemWidth:30,
                            itemHeight:20,
                            inRange:{
                                symbol:'rect'
                            },
                            outOfRange:{
                                symbol:'rect'
                            },
                            textStyle:{
                                color:'#fff'
                            },
                            right: '20',
                            bottom: '0'
                        },
                        geo: {
                            map: 'guangdong',
                            show:false,
                            center: [113.5107,23.2196],
                            zoom: 1,
                            aspectScale:0.8,
                            layoutCenter: ['46%', '42%'],
                            layoutSize:'110%',
                            silent: true
                        },
                        series: [
                        {
                            type: 'map',
                            mapType: 'guangdong',
                            center: [113.5107,23.2196],
                            zoom: 1,
                            aspectScale:0.8,
                            layoutCenter: ['46%', '42%'],
                            layoutSize:'110%',
                            label: {
                                emphasis: {
                                    color:'#fff',
                                    show:true
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: '#fff',
                                    borderColor: '#389BB7',
                                    areaColor: '#182c47',
                                },
                                emphasis: {
                                    color:'#fff',
                                    areaColor: '#389BB7',
                                    borderWidth: 0
                                }
                            },
                            data:_data   
                        },
                        {
                            type: 'scatter',
                            coordinateSystem: 'geo',
                            data: convertData(_data),
                            symbolSize: function (val) {
                                return val[2] / 40;
                            },
                            label: {
                                normal: {
                                    formatter: '{@[3]}',
                                    position: 'right',
                                    show: false
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: '#ddb926'
                                }
                            },
                            zlevel: 1
                        },
                        {
                            type: 'effectScatter',
                            coordinateSystem: 'geo',
                            data: convertData(_data.sort(function(a,b){
                                return b.value - a.value;
                            }).slice(0, 4)),
                            symbolSize: function (val) {
                                return val[2] / 40;
                            },
                            label: {
                                normal: {
                                    formatter: '{@[3]}',
                                    position: 'right',
                                    show: true
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: '#ddb926'
                                }
                            },
                            zlevel: 2
                        }]
                    };
                    myChart.setOption(option);
                    // 地图各市区板块点击事件处理,各市区的点击接口调用和页面渲染在下面对应的地方执行
                    myChart.on('click', function (params) {
                        if (params.data && params.data.id) {
                            var cp = null;
                            for (var j = 0; j < geoJson.features.length; j++) {
                                if (geoJson.features[j].properties.id==params.data.id) {
                                    cp = geoJson.features[j].properties.cp
                                    break
                                }
                            }
                            document.getElementById('area_name').innerText = ' > ' + params.data.name
                            commonFn.getCitiesMap(params.data.id, cp)
                            commonFn.qmqkfn(params.data.id);
                            // commonFn.tzFn(params.data.id);
                            // commonFn.tzhotFn(params.data.id);
                            commonFn.getFmData(params.data.id);
                            commonFn.bjTopArea(city_id,Index);
                            commonFn.blTimeAnalyse(params.data.id);
                            commonFn.getHotTitle(params.data.id);
                        }
                    });
                }
            });
        });
    },
    /*接口3 地区投资情况
    参数city代表城市行政id，idx表示标签页id*/
    tzFn:function(city,idx){
        $.get('/js/data3.json', function (data) {
            if (data) {
                var area_tz = echarts.init(document.getElementById("area_cont"));
                var areaTz = {
                    tooltip : {
                        trigger: 'axis',
                        axisPointer : {          
                            type : 'shadow'        
                        }
                    },
                    grid: {  
                        left:'4%',
                        top:'8%',  
                        bottom: '4%',  
                        containLabel: true  
                    }, 
                    xAxis:  {
                        type: 'value',
                        name: '个',
                        min: 0,
                        max: 500,
                        axisLine:{
                            lineStyle:{ color:'#fff'}
                        },
                        splitLine:{ show:false}
                    },
                    yAxis: {
                        type: 'category',
                        data: data.cityname,
                        axisLine:{
                            lineStyle:{ color:'#fff'}
                        }
                    },
                    series: [
                        {
                            name: data.title,
                            type: 'bar',
                            barWidth: '70%',
                            label: {
                                normal: {
                                    show: true,
                                    position: 'right'
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: function (params){
                                        var colorList = ['#49ceff','#f1b14d','#f93f70'];
                                        if (params.dataIndex > 2) {
                                            return colorList[params.dataIndex%3];
                                        }else{
                                            return colorList[params.dataIndex];
                                        }
                                    }
                                }
                            },
                            data: data.cityNum
                        }
                      
                    ]
                };
                area_tz.setOption(areaTz);
            }
        });
    },
    // 接口4 投资热门行业
    tzhotFn:function(city,idx){
        $.get('/js/data4.json', function (data) {
            if (data) {
                var fmNum = echarts.init(document.getElementById("fm_num"));
                var fmOpt = {
                    tooltip : {
                        trigger: 'axis',
                        axisPointer : {            
                            type : 'shadow'        
                        }
                    },
                    grid: {
                        left: '4%',
                        right: '4%',
                        bottom: '4%',
                        containLabel: true
                    },
                    xAxis : [{
                            type : 'category',
                            data : data.industry,
                            axisLine:{
                                lineStyle:{ color:'#fff'}
                            },
                            axisTick: {
                                show: false
                            }
                    }],
                    yAxis : [{
                        type : 'value',
                        name:'个',
                        splitLine:{ show:false},
                        axisLine:{
                            lineStyle:{ color:'#fff'}
                        }
                    }],
                    series : [
                        {
                            name:'数量',
                            type:'bar',
                            barWidth: '30px',
                            data:data.indNum,
                            itemStyle: {
                                normal: {
                                    color: function (params){
                                        var colorList = ['#3b85f9','#be7be5','#49ceff','#f1b14d','#f93f70'];
                                        return colorList[params.dataIndex];
                                    }
                                }
                            }
                        }
                    ]
                };
                fmNum.setOption(fmOpt);
            }
        });
    },
    // 接口5 登记赋码实时情况
    getFmData:function(city){
	    $.get('/js/data5.json', function (data) {
	        var _html = "";
	        if (data.length>0) {
	            $.each(data,function(i,n){
	                _html+='<tr>'+
	                      '<td>'+n.name+'</td>'+
	                      '<td>'+n.type+'</td>'+
	                      '<td>'+n.finiTime+'</td>'+
	                      '<td>'+n.area+'</td>'+
	                      '<td>'+n.status+'</td>'+
	                      '</tr>';
	            });
	            $("#register_fm").html(_html);
	        }
	    });
	    // 每隔一段时间更新数据
	    //setTimeout(commonFn.getFmData,1000);
    },
    // 广东省各市区地图数据
    getCitiesMap:function(id, cp){
        var city_id =  id + '00'
        // 切换各个地级市地图数据
        $.get('/js/cities/'+ city_id +'.json', function (geoJson) {
            var myChart = echarts.init(document.getElementById("gd_map"));
            echarts.registerMap(city_id, geoJson);
            $.get('/js/province_geo.json', function (geodata) {
                // 各地级市的接口6
                $.get('/js/data6.json', function (data) {
                    var _data = null,geoCoord;
                    var convertData = function (opt) {
                        var res = [],geoCoord;
                        for (var i = 0; i < opt.length; i++) {
                            for (var j = 0; j < geoJson.features.length; j++) {
                                if (geoJson.features[j].properties.name==opt[i].name) {
                                    geoCoord = geodata[opt[i].name];
                                    geoCoord = geoCoord.concat(opt[i].value);
                                    geoCoord = geoCoord.concat(opt[i].name);
                                    res.push(geoCoord);
                                }
                            }
                        }
                        return res;
                    };
                    if (data.length>0) {
                        _data = data;
                        var option = {
                            visualMap: {
                                type:'piecewise',
                                pieces:[
                                    {min:800,label:'800个以上',color:'#1f2d5a',symbol:'rect'},
                                    {min:641,max:800,label:'641-800个',color:'#243468',symbol:'rect'},
                                    {min:481,max:640,label:'481-640个',color:'#2b3b76',symbol:'rect'},
                                    {min:321,max:480,label:'321-480个',color:'#34478c',symbol:'rect'},
                                    {min:161,max:320,label:'161-320个',color:'#3a4f9e',symbol:'rect'},
                                    {min:0,max:160,label:'0-160个',color:'#4159af',symbol:'rect'}
                                ],
                                itemGap:0,
                                itemWidth:30,
                                itemHeight:20,
                                inRange:{
                                    symbol:'rect'
                                },
                                outOfRange:{
                                    symbol:'rect'
                                },
                                textStyle:{
                                    color:'#fff'
                                },
                                right: '20',
                                bottom: '0'
                            },
                            geo: {
                                map: city_id,
                                show:false,
                                center: cp,
                                layoutCenter: ['54%', '54%'],
                                layoutSize:'80%',
                                silent: true
                            },
                            series: [{
                                type: 'map',
                                mapType: city_id,
                                center: cp,
                                layoutCenter: ['54%', '54%'],
                                layoutSize:'80%',
                                label: {
                                    emphasis: {
                                        show:true
                                    }
                                },
                                itemStyle: {
                                    normal: {
                                        color: '#fff',
                                        borderColor: '#389BB7',
                                        areaColor: '#182c47',
                                    },
                                    emphasis: {
                                        color:'#fff',
                                        areaColor: '#389BB7',
                                        borderWidth: 0
                                    }
                                },
                                data:_data   
                            },
                            {
                                type: 'scatter',
                                coordinateSystem: 'geo',
                                data: convertData(_data),
                                symbolSize: function (val) {
                                    return val[2] / 40;
                                },
                                label: {
                                    normal: {
                                        formatter: '{@[3]}',
                                        position: 'right',
                                        show: false
                                    }
                                },
                                itemStyle: {
                                    normal: {
                                        color: '#ddb926'
                                    }
                                },
                                zlevel: 1
                            },
                            {
                                type: 'effectScatter',
                                coordinateSystem: 'geo',
                                data: convertData(_data.sort(function(a,b){
                                    return b.value - a.value;
                                }).slice(0, 4)),
                                symbolSize: function (val) {
                                    return val[2] / 40;
                                },
                                label: {
                                    normal: {
                                        formatter: '{@[3]}',
                                        position: 'right',
                                        show: true
                                    }
                                },
                                itemStyle: {
                                    normal: {
                                        color: '#ddb926'
                                    }
                                },
                                zlevel: 2
                            }]
                        };
                        myChart.setOption(option);
                    }
                });
            });
        });
    },
    //接口7 办件量TOP地区/部门/行业
    // id = 1 => 部门，id = 2 => 行业, id = 其他 => 地区
    bjTopArea: function(city,id){
        $.get('/js/data7.json', function (data) {
            if (data) {
                var fmNum1 = echarts.init(document.getElementById("fm_num1"));
                var fmNum2 = echarts.init(document.getElementById("fm_num2"));
                var idx = id == 1 ? '部门' : id == 2 ? '行业' : '地区'
                var _data1 = [
                    {"name": "其他" + idx, "value": 200, "scale": 20},
                    {"name": "Top5" + idx, "value": 200, "scale": 20}
                ];
                var _data2 = [];
                for (var i = 0; i < data.data.length; i++) {
                    if (data.data[i].name == _data1[0].name) {
                        _data1[0].value = data.data[i].value
                        _data1[0].scale = data.data[i].scale
                    } else {
                        _data1[1].value += data.data[i].value
                        _data1[1].scale += data.data[i].scale
                        _data2.push(data.data[i])
                    }
                }
                var option1 = {
                    series : [
                        {
                            type: 'pie',
                            radius : '35%',
                            center: ['50%', '50%'],
                            data: _data1,
                            label: {
                                normal: {
                                    color: '#fff',
                                    fontSize: '10',
                                    formatter: function(params) {
                                        return params.data.name + '\n' + params.data.value + '件 \n' + params.data.scale.toFixed(2) + '%'
                                    },

                                }
                            },
                            itemStyle: {
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                };
                var option2 = {
                    legend: {
                        orient: 'vertical',
                        y: 'center',
                        right: 10,
                        itemWidth: 10,
                        itemHeight: 10,
                        data:_data2,
                        textStyle: {
                            color: '#fff'
                        },
                        formatter: function (params) {
                            for (var i = 0; i < _data2.length; i++) {
                                if (_data2[i].name == params) {
                                    return params + ' ' + _data2[i].value + '件 ' + _data2[i].scale + '%';
                                }
                            }
                         }
                    },
                    series: [
                        {
                            type:'pie',
                            radius: ['25%', '40%'],
                            center: ['18%', '50%'],
                            avoidLabelOverlap: false,
                            label: {
                                normal: {
                                    color: '#fff',
                                    show: false,
                                    position: 'center'
                                },
                                emphasis: {
                                    color: '#fff',
                                    show: true,
                                    center: ['20%', '50%'],
                                    textStyle: {
                                        color: '#fff',
                                        fontSize: '12',
                                        fontWeight: 'bold'
                                    }
                                }
                            },
                            labelLine: {
                                normal: {
                                    show: false
                                }
                            },
                            data:_data2
                        }
                    ]
                };
                fmNum1.setOption(option1);
                fmNum2.setOption(option2);
            }
        })
    },
    //接口8 办理时长分析
    blTimeAnalyse: function(city){
        $.get('/js/data8.json', function (data) {
	        var _html = "";
	        if (data.length>0) {
	            $.each(data,function(i,n){
	                _html+='<tr>'+
	                      '<td>'+n.name+'</td>'+
	                      '<td>'+n.averageTime+'</td>'+
	                      '<td>'+n.limitTime+'</td>'+
	                      '</tr>';
	            });
	            $("#deal_time_box").html(_html);
	        }
	    });
    },
    //接口9 热门办件事项
    getHotTitle: function(city){
        $.get('/js/data9.json', function (data) {
            var canvas=document.getElementById('canvas');
            var ctx=canvas.getContext("2d");
            var width=550;
            var height=170;
            var textArr = data;
            canvas.width=width;
            canvas.height=height;
            // var image=new Image();
            //设置字体大小
            var getIndex = function (value) {
                var index = '';
                if (value < 10) {index = 11}
                else if (value >= 10 && value < 50) {index = 10}
                else if (value >= 50 && value < 100) {index = 9}
                else if (value >= 100 && value < 200) {index = 8}
                else if (value >= 200 && value < 300) {index = 7}
                else if (value >= 300 && value < 400) {index = 6}
                else if (value >= 400 && value < 500) {index = 5}
                else if (value >= 500 && value < 600) {index = 4}
                else if (value >= 600 && value < 700) {index = 3}
                else if (value >= 700 && value < 800) {index = 2}
                else if (value >= 800) {index = 1}
                return index;
            }
            var getFonSize = function (n) {
                var fontSize = '';
                switch (n) {
                    case 11: 
                        fontSize =  '12px Courier New';
                        break;
                    case 10: 
                        fontSize =  '14px Courier New';
                        break;
                    case 9: 
                        fontSize =  '16px Courier New';
                        break;
                    case 8: 
                        fontSize =  '18px Courier New';
                        break;
                    case 7: 
                        fontSize =  '20px Courier New';
                        break;
                    case 6: 
                        fontSize =  '22px Courier New';
                        break;
                    case 5: 
                        fontSize =  '24px Courier New';
                        break;
                    case 4: 
                        fontSize =  '26px Courier New';
                        break;
                    case 3: 
                        fontSize =  '28px Courier New';
                        break;
                    case 2: 
                        fontSize =  '30px Courier New';
                        break;
                    case 1: 
                        fontSize =  '32px Courier New';
                        break;
                }
                return fontSize;
            }
            var colorArr=["#f3bd66","#efe833","#c47eff","#ffea02","#7489f6","#7cb2bb","#d67271","#5a42b7","#c46a6d","c47eff"];
            var numArrL=[80,100,5,300,400,430,50,250,8,200];//初始的X
            var numArrT=[40,100,70,130,100,60,90,140,120,50];//初始的Y
            setInterval(function(){
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.save();
            for(var j=0;j<textArr.length;j++){
                numArrL[j]-=(j+1)*0.6;
                ctx.fillStyle = colorArr[j]
                ctx.font = getFonSize(getIndex(textArr[j].value));
                ctx.fillText(textArr[j].name,numArrL[j],numArrT[j]);
            }
            for(var i=0;i<textArr.length;i++){
                if(numArrL[i]<=-500){
                    numArrL[i]=canvas.width;
                }
            }
            ctx.restore();
            },50)
	    });
    }
};
commonFn.qmqkfn();
commonFn.mapFn();
commonFn.getFmData();
commonFn.bjTopArea();
commonFn.blTimeAnalyse();
commonFn.getHotTitle();
// 办件量Tops地区标签页点击
$("#chart_tab a").click(function(){
    var Index = $(this).index();
    console.log(Index)
    $(this).addClass("on").siblings().removeClass("on");
    // Index为1代表部门，2代表行业，其他代表地区
    commonFn.bjTopArea(city_id,Index);
});
// 返回广东省
$("#province_name").click(function(){
    commonFn.mapFn();
    document.getElementById('area_name').innerText = '';
})

});
