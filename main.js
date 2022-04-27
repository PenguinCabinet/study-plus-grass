var cal = new CalHeatMap();
//cal.init({domain:"month",itemSelector: "#user-heatmap",range: 3});
const range_cal=6;
onload_draw_run();

function Get_now(){
	return dayjs().tz()
}


async function draw_run(used_id){
    let user_json_data=await (await fetch(`https://api.studyplus.jp/2/users/${used_id}/`)).json()
    console.log(user_json_data)
    console.log(user_json_data["nickname"])
    document.getElementById("user-name").textContent=user_json_data["nickname"];

    //.format('M月D日 H/mm')
    let now_time=Get_now()
    let before_1_year_time=Get_now()
    before_1_year_time=before_1_year_time.add(-range_cal,"month");

    let now_time_str=now_time.format('YYYY-MM-DD')
    let before_1_year_time_str=before_1_year_time.format('YYYY-MM-DD')

    console.log(now_time_str);
    console.log(before_1_year_time_str);

    let time_json_data=await (await fetch(`https://api.studyplus.jp/2/users/${used_id}/records/series/time?from=${before_1_year_time_str}&to=${now_time_str}`)).json()

    let cal_data={};
    for(let i=0;i<time_json_data["dates"].length;i++){
        let date=dayjs(time_json_data["dates"][i], "YYYY-MM-DD");
        let time_data=0;
        for(let j=0;j<time_json_data["series"].length;j++){
            console.log(time_json_data["series"][j]["values"][i]);
            time_data+=time_json_data["series"][j]["values"][i];
        }
        cal_data[date.unix().toString()]=time_data/3600.0;
    }

    /*
    now_time=now_time.add(1,"date");
    while(now_time.date()!=1){
        let date=dayjs(now_time, "YYYY-MM-DD");
        cal_data[date.unix().toString()]=0;
        now_time=now_time.add(1,"date")
        console.log(now_time.format('YYYY-MM-DD'))
    }
    */

    Is_zero_cal={}

    mean_cal_data=0;
    s_cal_data=0
    
    for (let k in cal_data) {
        mean_cal_data+=cal_data[k];
        if(cal_data[k]==0){
            Is_zero_cal[k]=true
        }else{
            Is_zero_cal[k]=false
        }
    }
    mean_cal_data/=Object.keys(cal_data).length ;

    for (let k in cal_data) {
        s_cal_data+=Math.pow(cal_data[k]-mean_cal_data,2);
    }
    s_cal_data/=Object.keys(cal_data).length ;
    s_cal_data=Math.sqrt(s_cal_data);

    console.log(Is_zero_cal);

    for (let k in cal_data) {
        if(!Is_zero_cal[k]){
            cal_data[k]=(cal_data[k]-mean_cal_data)/s_cal_data;
            cal_data[k]=Math.exp(cal_data[k])
        }else{
            cal_data[k]=-100;
        }
    }
    console.log(cal_data);
    
    document.getElementById("user-heatmap").textContent="";

    var now = new Date();
    cal.init({
        domain:"month",
        itemSelector: "#user-heatmap",
        range: range_cal,
        data:cal_data,
        start: new Date(now.getFullYear(), now.getMonth() - range_cal+1),
        end:now,
        legend: [
            Math.exp(0),
            Math.exp(0.25),
            Math.exp(0.5),
            Math.exp(0.75),
            Math.exp(1),
            Math.exp(1.5),
            Math.exp(2)
        ],
        legendColors: {
            min: "#efefef",
            empty: "#efefef",
            max: "green",
        }
    });

    document.getElementById("user-name").textContent=user_json_data["nickname"];

}

function button_draw_run(){
    let user_id=document.getElementById("input_id").value;
    console.log(user_id)
    const params = new URLSearchParams(window.location.search)
    params.set('userid', user_id)
    window.location.search = params.toString()
}

function onload_draw_run(){
    const searchParams = new URLSearchParams(window.location.search)
    const user_id=searchParams.get('userid');
    if(user_id===null){
        var now = new Date();
        cal.init({
            domain:"month",
            itemSelector: "#user-heatmap",
            range: range_cal,
            start: new Date(now.getFullYear(), now.getMonth() - range_cal+1),
            end:now,
            legend: [
                Math.exp(0),
                Math.exp(0.25),
                Math.exp(0.5),
                Math.exp(0.75),
                Math.exp(1),
                Math.exp(1.5),
                Math.exp(2)
            ],
            legendColors: {
                min: "#efefef",
                empty: "#efefef",
                max: "green",
            }
        });
    }else{
        document.getElementById("input_id").value=user_id;
        draw_run(user_id);
    }
}

