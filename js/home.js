const getDB= firebase.database()
var usersRef = getDB.ref('users');
var questionsRef = getDB.ref('questions');
const signOutBtn=document.getElementById('signOutBtn');
const currentUser=JSON.parse(sessionStorage.getItem('user'))
var letsPlayQuesSound= new Audio("music/Let's Play Question.aac")
var finalAnswerSound= new Audio("music/Final Answer.aac")
var quesSound= new Audio("music/background_sound.aac")
var loseSound=new Audio("music/Lose.aac");
var five_last_second_sound=new Audio('music/5lastsecond.aac');
let questionNumber=1;
var winMoney;
let correctAnswer;
var secondInterval;
let paused_second;
var serverRef = getDB.ref('server');
const questionArray=[]
const random_number_array=[]


/*getDB.ref("questions/"+"6").set({
    content:'Người khai sinh ra chữ quốc ngữ Việt Nam có quốc tịch ở đâu ?',
    answer1:"A. Pháp",
    answer2:"B. Ấn Độ",
    answer3:"C. Bồ Đào Nha",
    answer4:"D. Trung Quốc",
    correct:3,
})*/

//KIEM TRA SESSION NGUOI CHOI
if(currentUser){
    getUser()
    progressAlert('<h1 class="ui center aligned header">Đang tải tải dữ liệu...</h1>',false,null)
    /* kiểm tra mảng câu hỏi đã load về từ firebase */
  questionsRef.on('value',(snapshot)=>{
    snapshot.val().forEach(te=>{
        questionArray.push(te)
    })
    for(let i=0;i<12;i++){
        random_number_array.push(i)
    }
    if(random_number_array.length==12){
        random_number_array.sort(() => Math.random() - Math.random()).slice(0, 12)
    }
        loadQuestion(questionNumber)
})


serverRef.on('value',(el)=>{

    /* kiểm tra trạng thái server */
    if(!el.val().active){
        errorAlert('Server đã tắt, vui lòng vào game trong thời gian khác',true,'error')  
    }else{
        errorAlert(null,false,null) 
    }
})
}else{
    location.href="index.html"
}


///DEM NGUOC THOI GIAN
function countDown(second){
   secondInterval= setInterval(()=>{
    second--
    paused_second=second
$('.countdown').text((second)).transition('pulse')
if(second==5){
    five_last_second_sound.play()
   quesSound.ended 
}
else if(second==0){
    clearInterval(secondInterval)
    new Audio("music/Time's up.aac").play()
    setTimeout(()=>{
        if(questionNumber>=5){
            errorAlert('Đã hết thời gian, phần thưởng nhận được là '+winMoney,true,'failed')
        }else{
         errorAlert('Đã hết thời gian, chơi lại thôi nào',true,'failed')    
        }
    },1000)
   updateUser(0)
}
},1000)
}

//THONG BAO SU CO 
function errorAlert(message,status,status_name){
    $('.ui.modal').html(`<h1 class="ui center aligned header" style="color:white;background: #db2828;">
    </h1><br>`)
    if(status){
        $('.ui.modal .header').text(message)
        $('.ui.modal').append('<button class="ui exit red button">Thoát</button>')
        $('.exit.button').click(function(){
            $('.ui.modal').modal('hide')
        })
        if(status_name=='failed'){
            $('.ui.modal').append('<button class="ui reload green button">Chơi lại</button>')
        $('.reload.button').click(function(){
            location.reload()
        })
        }
        $('.ui.modal').modal({
            onHide:()=>{
                    location.href="index.html"
            },
          }).modal('show')   
          $('#game_main').fadeOut()
        clearInterval(secondInterval)
    }else{
        $('.ui.modal').modal({
            onHide :()=>{
                $('#game_main').fadeIn();
                if(paused_second){
                    //countDown(paused_second)  
                }
            },}).modal('hide')
    }
}


//THONG BAO TIEN TRINH 
function progressAlert(message,action,status_name){
    $('.ui.modal').html(message) .modal({
        closable  : false,
      }).modal('show')
      //clearInterval(secondInterval)
      allComponents(false)
    if(action){

        $('.ui.modal').append('<center style="padding:10px"><button class="ui continue green button">Tiếp tục</button></center>')
        $('.continue.button').click(function(){
                $('.ui.modal').modal('hide')
                allComponents(true)
        })

        if(status_name=='special_question'){
            $('.ui.modal').append('<center style="padding:10px"><button class="ui stop red button">Dừng cuộc chơi</button></center>')
            $('.stop.button').click(function(){
                progressAlert('<h2 class="ui header">Bạn đã dừng cuộc chơi, số tiền thưởng ra về là '+winMoney+'</h2>\
                ',true,'special_question_stop')
            })

            $('.continue.button').click(function(){
                if(questionNumber==5){
                    progressAlert('<h2 class="ui header">Bạn được nhận thêm 1 quyền trợ giúp là\
                    "Hỏi ý kiến nhà thông thái"</h2>',true,'special_question_gift')
                    allComponents(false)
                }else{
                    questionNumber+=1;
                    loadQuestion(questionNumber)
                }
            })
        }
        
    $('.ui.modal').modal({
        onHide :()=>{
            if(status_name=='normal_question'){
                quesSound.play()
                //countDown(paused_second)
            }
            else if(status_name=='special_question_stop'){
            location.href="index.html" 
        }
        else if(status_name=='special_question_gift'){
            $('.help:eq(3)').transition('fade left')
            questionNumber+=1;
            loadQuestion(questionNumber)
        } }
        })}
}
//

//HIỂN THỊ TÊN VÀ KIỂM TRA QUYỀN NGƯỜI CHƠI
function getUser(){
$('#user_welcome .header').text('Xin chào '+currentUser.name)
$('#user_name').text(currentUser.name)
getDB.ref("users/"+currentUser.name).on('value',(el)=>{
    if(el.val().permission==0){
        errorAlert('Tài khoản của bạn đã bị khóa',true,'error')  
    }else{
        errorAlert(null,false,null)  
    }
})
}
//

//NÚT ĐĂNG XUẤT
signOutBtn.onclick=()=>{
    let text = "Bạn muốn thoát trò chơi ?";
    if (confirm(text) == true) {
        sessionStorage.removeItem("user")
        location.href="index.html"
    }
}

/*VÔ HIỆU HÓA HOẶC TẤT CẢ*/
function allComponents(isEnabled){
    if(!isEnabled){
            $('.choice').css('pointer-events','none')
    $('.helps').css('pointer-events','none').css('opacity', '0.4')
    clearInterval(secondInterval)
    five_last_second_sound.pause()
    quesSound.pause()
    }else{
        $('.helps').css('pointer-events','visible').css('opacity', '1')
        $('.choice').css('pointer-events','visible')
    }
}


//LOAD TỪNG CÂU HỎI
function loadQuestion(question_number){
    let random_unique_question_number=random_number_array[question_number-1]
    $('.question').css('font-size','60px')
    allComponents(false)
    $('.choice').removeClass('disabled')
    .css('background','linear-gradient(to right, rgb(5, 117, 230), rgb(2, 27, 121))')
    .css('border','4px solid #a5673f').css('color','white')

    $('.question').css('background','linear-gradient(to right, rgb(5, 117, 230), rgb(2, 27, 121))')
    
    $('.question').transition({
        animation : 'fly down',
        duration:2000,
        onStart:function(){
            letsPlayQuesSound.play()
        },
        onComplete:function(){
            letsPlayQuesSound.ended
            letsPlayQuesSound.onended=()=>{
                 quesSound.loop=true
                 quesSound.play()
                 
                 $('.question').animate({'font-size':'40px'},{
                    duration:300,
                    start:function(){
                        //countDown(31)
                        $('.choices').transition({
                    animation : 'fly up',
                    interval  : 300,
                    duration:800,
                    onComplete:function(){
                       allComponents(true)
                    }
                  }) 
                    }
                })
            }
        }
      })
  
   const questionContent=questionArray[random_unique_question_number];
    $('.question').text(questionContent.content)
    $('.choice:eq(0)').text(questionContent.answer1)
    $('.choice:eq(1)').text(questionContent.answer2)
    $('.choice:eq(2)').text(questionContent.answer3)
    $('.choice:eq(3)').text(questionContent.answer4)
    correctAnswer=questionContent.correct

     $('.money:eq('+($('.money').length-(questionNumber))+')').addClass('active').siblings().removeClass('active')
   
}
//

//NÚT CHỌN ĐÁP ÁN
$('.choice').click(function(){

    const choiceId=$(this).data('id');
    allComponents(false)
    $(this).css('background','#a5673f').css('border','4px solid white')
    finalAnswerSound.play()
    //quesSound.pause()
    finalAnswerSound.onended=()=>{
    if(choiceId==correctAnswer){
       winMoney=$('.active.item.money').text().slice(4)
        var winSound= new Audio("music/Win.aac");
        winSound.play()
        updateUser(questionNumber)
         $(this).css('background','#21ba45')
winSound.onplay=()=>{
    allComponents(false)
}
         winSound.onended=()=>{
            $('.choices').transition('hide')
            $('.question').text(winMoney).css('background','#21ba45')
            .animate({'font-size':'60px'},{
                duration:300,
                start:function(){
                    //allComponents(false)
                    //countDown(31)
                },
                complete:function(){
                    $(this).transition({
                        animation:'fly up',
                        duration:1000,
                    onComplete:function(){

                        let text = "<h1 class='ui header'>"
                        if(questionNumber==5 || questionNumber==10){
                        text += "Bạn đã vượt qua cột mốc câu hỏi số "+questionNumber
                        +", số tiền thưởng đang có là "+winMoney+". Bạn đã sẵn sàng tiếp\
                         tục với câu hỏi số "+(questionNumber+1)+" chưa ?";
                       progressAlert(text,true,'special_question')
                    }else if(questionNumber==12){
                       text+="Xin chúc mừng bạn đã chiến thắng chương trình, số tiền thưởng nhận được là "+winMoney+" "
                      new Audio('music/winner_sound.aac').play()
                       progressAlert(text,true,'special_question_stop')
                    }else{
                        questionNumber+=1;
                        loadQuestion(questionNumber)
                    }
                    text+='</h1>'

                    }})
                }
            })
         }
    }else{
            loseSound.play()
            loseSound.onplay=()=>{
                 updateUser(0)
            //clearInterval(secondInterval)
             $(this).css('background','#db2828')
            }

            loseSound.onended=()=>{
                if(questionNumber>=5){
                    errorAlert('Bạn sẽ ra về với phần thưởng là '+$('.active.money').text().slice(3),true,'failed')
                }else{
                     errorAlert('Bạn đã trả lời sai, chơi lại thôi nào',true,'failed')
                }
             }
           
    }
}
    })
    //


    //CẬP NHẬT ĐIỂM NGƯỜI CHƠI
function updateUser(score){
    getDB.ref("users/"+currentUser.name).update({
        score:score
    })
}

//NÚT TRỢ GIÚP
 $('.help').click(function(){
    $(this).addClass('disabled').css('pointer-events','none')
    //clearInterval(secondInterval)
    //quesSound.pause()
 })

 //NÚT TRỢ GIÚP 50/50
 $('.help:eq(0)').click(function(){
    new Audio('music/50-50.aac').play()
    //const audio = document.createElement('audio');

    //audio.setAttribute('src','music/50-50.acc');
    //audio.play()
    const arr=[]
    for(let i=0;i<4;i++){
        if($('.choice:eq('+i+')').data('id')!=correctAnswer){
           arr.push(i)
        }
    }
    arr.slice(1).forEach(element=>{
        $('.choice:eq('+element+')').addClass('disabled').css('pointer-events','none')
    })
    //countDown(paused_second)
    //quesSound.play()
    })

     //NÚT TRỢ GIÚP GỌI ĐIỆN NGƯỜI THÂN
    $('.help:eq(1)').click(function(){
        const phoneAFriendSound=new Audio('music/Phone-A-Friend.aac')
        phoneAFriendSound.play()
        progressAlert('<h1 class="ui center aligned header"\
         style="color:white;background: rgb(33, 133, 208);">Đang gọi\
          cho người thân, vui lòng đợi...</h1>',false,'normal_question')
        phoneAFriendSound.onended=()=>{
             for(let i=0;i<4;i++){
            if($('.choice:eq('+i+')').data('id')==correctAnswer){
             progressAlert('<h1 class="ui center aligned header"\
              style="color:white;background: rgb(33, 133, 208);">Tôi xin\
               trợ giúp cho người chơi là đáp án: '+$('.choice:eq('+i+')').text()+'</h1>'
               ,true,'normal_question')
            }
        }
        }
        })

        $('.help:eq(2)').click(function(){
            const askTheAudienceAudio=new Audio('music/Ask The Audience.aac')
            askTheAudienceAudio.play()
            progressAlert('<center><lord-icon\
            src="https://cdn.lordicon.com/gqdnbnwt.json" trigger="loop" delay="2000"\
            colors="primary:#121331,secondary:#3080e8" style="width:250px;height:250px">\
        </lord-icon></center><h1 class="ui center aligned header"\
        style="color:white;background: rgb(33, 133, 208);">Khán giả đang bình chọn\
         đáp án, vui lòng đợi...</h1>',false,null)
            askTheAudienceAudio.onended=()=>{
             let html=`<center style="padding:40px"><canvas id="myChart" style="transform:scale(1.1);width:100%;max-width:600px;"></canvas></center>`
             progressAlert(html,true,'normal_question')
             var yValues = [25, 25, 45, 25];
             var xValues=[]
             var barColors = [
                 "black",
                 "black",
                 "black",
                 "black"];
             for(let i=1;i<=4;i++){
                 xValues.push($('.choice:eq('+(i-1)+')').text())
                 if(i==correctAnswer){
                     yValues[i-1]=80
                     barColors[i-1]='#2b5797'
                 }else{
                     yValues[i-1]=120/3
                 }
             }
    new Chart("myChart", {
    type: "doughnut",
    data: {
     labels: xValues,
     datasets: [{
       backgroundColor: barColors,
       data: yValues
     }]
    },
    options: {
     title: {
       display: true,
       text: "Bình chọn đáp án của tổng số 200 khán giả"
     }
    }
    });
            }
         })
        
         //NÚT TRỢ GIÚP GỌI NHÀ THÔNG THÁI
    $('.help:eq(3)').click(function(){
        const pickExpertSound=new Audio('music/pick_expert.aac')
        const phoneExpertSound=new Audio('music/ask-pro.aac')
        pickExpertSound.play()
        const experts=[{name:'Ronaldo',image:'image/ronaldo.jpg'},
        {name:'Albert Einstein',image:'https://sohanews.sohacdn.com/160588918557773824/2022/1/16/albert-einstein-16423329346181127465252.jpg'},
        {name:'Đàm Vĩnh Hưng',image:'https://nld.mediacdn.vn/2021/1/29/dam-vinh-hung-xuc-dong-ke-ve-moi-tinh-dau-voi-ban-gai-da-mat-1571402980017846693901-16118908461411753056708.jpg'}]
        let html=`<h1 class="ui center aligned header" style="color:white;background: rgb(33, 133, 208);">Vui lòng chọn nhà thông thái phù hợp</h1>\
        <div class="ui link three doubling cards" style="padding:20px">`
 for(let i=0;i<experts.length;i++){
      html+=`<div class="expert card" data-id="${i}">\
    <div class="image">\
      <img style="height:180px;object-fit: cover;" src="${experts[i].image}">\
    </div>\
    <div class="content">\
    <a class="ui center aligned header">${experts[i].name}</a>\
  </div>\
  </div>`
 }
 html+=`</div>`
        progressAlert(html,false,null)
        $('.expert').click(function(){
            var id=$(this).data('id')
            pickExpertSound.pause()
            phoneExpertSound.play()
            progressAlert('<center style="padding:10px">\
            <img class="ui expert medium image" style="border:10px solid rgb(33, 133, 208);\
            border-radius:50%;height:200px;width:200px;object-fit:cover"\
             src="'+experts[id].image+'">\
            </center><h1 class="ui center aligned header"\
             style="color:white;background: rgb(33, 133, 208);">\
            '+experts[id].name+' đang tư vấn cho bạn...</h1>',false,null)
    
            $('.expert').transition('set looping')
            .transition('pulse', '1000ms')

        phoneExpertSound.onended=()=>{
            for(let i=0;i<4;i++){
           if($('.choice:eq('+i+')').data('id')==correctAnswer){
            progressAlert('<center style="padding:10px">\
            <img class="ui medium image" style="border:10px solid rgb(33, 133, 208);\
            border-radius:50%;height:200px;width:200px;object-fit:cover"\
             src="'+experts[id].image+'">\
            </center><h1 class="ui center aligned header"\
             style="color:white;background: rgb(33, 133, 208);">\
             Tôi xin trợ giúp cho người chơi là đáp án: '+$('.choice:eq('+i+')').text()+'</h1>\
             ',true,'normal_question')
           }
       }
       }
        
    })
        })

