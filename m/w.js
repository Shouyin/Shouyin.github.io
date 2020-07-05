/*
 * w.js for whmeow project
 * For better use experience, please stop inspecting this file.
 * Honest saying, nothing is interesting here.
 * 
 * Written by Shouyin, 3 July 2020
 *
*/


// consts
const CATBRO_GIFS = 6;
const EXPRESSIONS = ["ntip", "nfat", "nstaring", "npositive", "nread", "nmusic", "dshock", "dtip"]

// achievements
const ACHIEVEMENTS = 12;
const ACH_DOM = 1;
const ACH_HAV = 2;
const ACH_5H = 3;
const ACH_3H = 4;
const ACH_2H = 5;
const ACH_1H = 6;
const ACH_45 = 7;
const ACH_30 = 8;
const ACH_15 = 9;
const ACH_01 = 10;
const ACH_ESC = 11;
const ACH_IN = 12;

// monologue
const EASTERS = [
        ["听说挑西瓜要好好看瓜皮的纹路和瓜蒂的干燥程度哦！<br />不过我也懒得挑就是啦。", "ntip"],
        ["如果觉得累了，睡一觉也没关系哦？", "ntip"],
        ["听说运动后喝矿泉水更好哦！<br />不过我都是喝饮料啦，要不然怎么这么胖胖。", "nfat"],
        ["瘫在椅子上虽然舒服，<br />但是瘫久了腰好痛..", "nfat"],
        ["无糖饮料可能会造成肠道菌群紊乱哦。<br />所以我现在都喝全糖饮料<br />（不是因为好喝。", "ntip"],
        ["做麻辣烫的时候，<br />加一点牛奶会让汤更浓哦。<br />虽然加多了汤会变成渣渣就是了，啊啊锅糊了。", "ntip"],
        ["汪汪，我其实是狗勾哦。<br />..开玩笑啦，其实我是一只深海灯笼鱼。", "nstaring"],
        ["一位智者曾经说过：<br />洗衣机里的水实际上是衣服汤。", "nstaring"],
        ["不要在休息的时候让我等太久哦..<br />蹭蹭。", "ntip"],
        ["以前我是个可好强的猫猫呢！<br />什么事情都要做到最好才是猫猫的信条！<br />但现在只要努力就好啦。", "npositive"],
        ["不要被厉害的人影响到哦。<br />试着专注于自己的节奏吧！", "npositive"],
        ["有猫猫来信！<br />喵喵喵：喵喵喵喵喵，喵喵喵？<br />——喵喵喵", "ntip"],
        ["我有时候想变成一只狗勾<br />你想呀，狗勾什么时候都很开心不是吗？<br />不过狗勾没有我这么可爱的爪爪，所以算啦，喵喵。", "npositive"],
        ["下面由一位成功猫猫介绍它的成功秘诀！<br />\"咩咩～\"<br />说的太棒了！", "ntip"],
        ["上一次我去买汉堡没拿稳，掉到了地上！<br />好伤心哦..<br />不过一想到我一个猫猫会自己买汉堡，好厉害！<br />于是我就不难过啦！", "ntip"],
        ["现在很多自助餐都有海鲜对吧？<br />那么他们和海鲜自助餐有什么区别呢！", "ntip"],
        ["我很喜欢书哦。<br />虽然只是把它们放在书架上的程度罢了，喵喵。", "ntip"],
        ["虽然都在喜爱列表里，<br />但是听到某些歌的时候还是会跳过啦。", "nmusic"],
        ["以前我很不喜欢睡午觉，<br />但是后来我有了一小块毛毛地毯可以趴，就喜欢上啦！", "npositive"],
        ["如果运气好可以看见茶茶丸哦。", "ntip"],
        ["如果运气好可以看见柠檬娜哦。", "ntip"],
        ["我没有口癖哦！<br />不像那个游戏里的动物啦。", "ntip"],
        ["听说猫猫给人感觉可爱的原因是因为长得像婴儿呢！<br />大大的眼睛肉肉的脸。", "ntip"],
        ["我接到过一个诈骗电话，<br />电话那头说我有猫猫走丢了。<br />\"我怎么会走丢！\"，然后我就把电话挂了。", "ntip"],
        ["猫猫怎么胖都很可爱，所以我很可爱！<br />明白了吗！", "ntip"],
        ["\"今日计划：保持可爱\"<br />好忙哦。", "ntip"],
        ["我有些时候会讲些无厘头的话给猫猫朋友哦。<br />你想，什么都可以讲才是好朋友的证明嘛！<br />谢谢你能够包容我，喵喵。", "ntip"],
        ["半夜玩手机好爽哦！<br />周围没有喧嚣，只有你和互联网上无尽的信息流，<br />很自由不是吗？<br />不过很容易困啦。打哈欠。", "nmusic"],
        ["难过的时候，我可以在你的腿上趴一会。<br />摸摸我吧？", "npositive"],
    // dom
        ["呜哇！<br />我怎么在这里！哇耶。", "dshock"],
        ["看啊，我这肉体美！<br />都是不懈锻炼出来的哦！哇耶。", "dtip"],
        ["要记得适可而止哦！哇耶。", "dtip"]
];

// greetings
const GREETINGS = [
    "棒！",
    "真棒！",
    "好棒！",
    "辛苦了！",
    "休息一会吧！",
    "很努力了哦！",
];

// seconds passed for the counter to change
const UNIT = 60;
const FIRST_STAGE_DURATION = 60;
const STAGES = 5;
const SECOND_STAGE_WAIT = 2;
const BREAK = 10;
const CATGIF_INTV = 20;


// globals
let elem_id$ = (elem_id) => {return document.getElementById(elem_id);}
let cur_time_passed = 0;

let first_stage_intv = null;
let second_stage_timeout = null;
let current_stage = 1;

// elements
let wh_counter = elem_id$("whCounter");
let catbro = elem_id$("catbro");
let stage2_greeting = elem_id$("stage2Greeting");
let stage2_naudio = elem_id$("stage2naudio");
let stage2_button = elem_id$("stage2Button");
let stage3_button = elem_id$("stage3Button");
let stage4_counting = elem_id$("stage4Counting");
let stage5_greeting = elem_id$("stage5Greeting");
let stage5_button = elem_id$("stage5Button");
let stage5_naudio = elem_id$("stage5paudio");
let monologcha = elem_id$("monologCha");
let nav = elem_id$("navg");

let last_easter = -1;

// to be filled
let stage_boxes = [];
let catbro_gifs = [];
let achievement_got = [];
let achievement_elems = [];

// copied from MDN hehe
let getRandomInt = (max) => 
{
  return Math.floor(Math.random() * Math.floor(max));
}


// initialize functions
// only called in the beginning
let init = () => 
{
    
    for(let i = 1; i < CATBRO_GIFS + 1; i++) catbro_gifs.push("res/w" + i.toString() + ".gif");
    // collect all achievement draws
    
    for(let i = 0; i < ACHIEVEMENTS; i ++) achievement_got.push(false);
    for(let i = 1; i < ACHIEVEMENTS + 1; i ++) achievement_elems.push(elem_id$("ach" + i.toString()));
    
    
    // collect all stage boxes
    for(let i = 0; i < STAGES; i ++) stage_boxes.push(elem_id$("stage" + (i + 1).toString() + "Box"));
    
    // set button onclick
    stage2_button.addEventListener("click", to_forth_onclick);
    stage5_button.addEventListener("click", first_stage);
    stage3_button.addEventListener("click", to_forth_onclick);
    catbro.src = catbro_gifs[getRandomInt(catbro_gifs.length)];
};

let open_stage = (stage) => 
{
    console.log("[open_stage] now to stage" + stage.toString());
    stage_boxes[current_stage - 1].style.display = "none";
    stage_boxes[stage - 1].style.display = "flex";
    current_stage = stage;
}


let load = () => 
{
    // check local storage for savings
    let local_stored = localStorage.getItem("cur_time_passed");
    if (local_stored != null) {
        cur_time_passed = local_stored;
        wh_counter.innerHTML = cur_time_passed.toString();
    }
    
    // load achievement
    for(let i = 1; i < ACHIEVEMENTS + 1; i ++) {
        let key = "ach" + i.toString();
        let ach_res = localStorage.getItem(key);
        if(ach_res != null && ach_res == "true") {
            give_achievement(i);
        }
    }
}


let store_achievement = (achievement) => {
    let key = "ach" + achievement.toString();
    localStorage.setItem(key, "true");
    
}


let give_achievement = (achievement) => 
{
    if(achievement_got[achievement - 1]) {
        return;
    }
    achievement_got[achievement - 1] = true;
    achievement_elems[achievement - 1].style.display = "block";
    
    // sound FX?
    // local Storage..
    store_achievement(achievement);
}


let first_stage_checking_achievement = () => {
    let time_ach_map = {
        "1": ACH_01,
        "15": ACH_15,
        "30": ACH_30,
        "45": ACH_45,
        "60": ACH_1H,
        "120": ACH_2H,
        "180": ACH_3H,
        "300": ACH_5H,
        "480": ACH_IN,
    };
    let map_keys = Object.getOwnPropertyNames(time_ach_map);
    for(let i = 0; i < map_keys.length; i ++) {
        let time_str = map_keys[i];
        let time = Number(time_str);
        if(cur_time_passed >= time) {
            give_achievement(time_ach_map[map_keys[i]]);
        }
    }
}


// checking function for the first stage
// checking in every minute
let first_stage_checking = () => 
{
    
    cur_time_passed ++;
    // changing counter
    wh_counter.innerHTML = cur_time_passed.toString();
    
    // checking if still in stage 1
    if(cur_time_passed % FIRST_STAGE_DURATION == 0) {
        clearInterval(first_stage_intv);
        
        // stage 2..
        second_stage();
    } else if (cur_time_passed % CATGIF_INTV == 0) {
        let random_cat = getRandomInt(catbro_gifs.length);
        if(random_cat == 2) {
            give_achievement(ACH_HAV);
        }
        if(catbro_gifs[random_cat]) {
            catbro.src = catbro_gifs[random_cat];
        } else {
            catbro.src = catbro_gifs[0];
        }
        
    }
    
    first_stage_checking_achievement();
    
    
    
    // checking for achievements
    
    // update localStorage here?
    localStorage.setItem("cur_time_passed", cur_time_passed.toString());
}


let first_stage = () => 
{
    open_stage(1);
    
    // set interval
    first_stage_intv = setInterval(first_stage_checking, UNIT * 1000);
}


let second_stage = () => 
{
    open_stage(2);
    
    stage2_greeting.innerHTML = GREETINGS[getRandomInt(GREETINGS.length)];
    stage2_naudio.volume = 0.2;
    stage2_naudio.play();
    
    second_stage_timeout = setTimeout(third_stage, SECOND_STAGE_WAIT * UNIT * 1000);
}


let third_stage = () => 
{
    give_achievement(ACH_ESC);
    open_stage(3);
    
}


let forth_stage_min = 0;
let forth_stage_second = 0;
let forth_stage_counter_intv = null;

let forth_stage = () => 
{
    // animation
    stage4_counting.style.marginTop = "2000px";
    open_stage(4);
    setTimeout(() => {
        stage4_counting.style.marginTop = "12px";
    }, 200);
    
    // prepare stage
    forth_stage_min = BREAK;
    forth_stage_check();
    forth_stage_counter_intv = setInterval(forth_stage_check, 1000);
}


let forth_stage_check = () => 
{
    if(forth_stage_second == 0) {
        if(forth_stage_min == 0) {
            clearInterval(forth_stage_counter_intv);
            fifth_stage();
            return;
        }
        forth_stage_min --;
        forth_stage_second = UNIT;
    }
    forth_stage_second --;
    let second = forth_stage_second.toString();
    if (forth_stage_second < 10) second = "0" + second;
    stage4_counting.innerHTML = forth_stage_min.toString() + ":" + second;
}


let to_forth_onclick = () => 
{
    if(current_stage == 2) clearTimeout(second_stage_timeout);
    forth_stage();
} 


let fifth_stage = () => 
{
    open_stage(5);
    let greeting_index = getRandomInt(EASTERS.length);
    if(greeting_index == last_easter) {
        // second random, hopefully not same as the last one
        greeting_index = getRandomInt(EASTERS.length);
    }
    last_easter = greeting_index;
    let chosen_greeting = EASTERS[greeting_index];
    if(chosen_greeting == undefined) {
        chosen_greeting = EASTERS[0];
    }
    stage5_greeting.innerHTML = chosen_greeting[0];
    if(chosen_greeting[1][0] == "d") {
        give_achievement(ACH_DOM);
    }
    monologcha.src = "res/" + chosen_greeting[1] + ".png";
    
    stage5_naudio.volume = 0.3;
    stage5_naudio.play();
}





// main code path
init();
load();
first_stage();
// second_stage();
// third_stage();
// forth_stage();
// fifth_stage();