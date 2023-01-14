const registerBtn=document.getElementById('registerBtn')
const loginBtn=document.getElementById('loginBtn')
const loginForm=document.getElementById('loginForm')
const registerForm=document.getElementById('registerForm')
const getDB= firebase.database()
var usersRef = getDB.ref('users');

const showLoginForm=()=>{
      $('#registerForm').slideUp('slow')
    $('#loginForm').slideDown()
}

const showRegisterForm=()=>{
    $('#registerForm').slideDown('slow')
    $('#loginForm').slideUp()
}


registerBtn.onclick=()=>{
    showRegisterForm()
}
loginBtn.onclick=()=>{
  showLoginForm()
}

loginForm.onsubmit=(event)=>{
    var name=document.getElementById('loginName').value;
    event.preventDefault();
         getDB.ref("users/"+name).get().then((sn)=>{
            if(sn.exists()){
                sucessLogin(sn.val())
            }else{
                alert('Tên tài khoản sai')
            }
         })
}

function sucessLogin(user){
   sessionStorage.setItem('user',JSON.stringify(user))
   loginForm.submit()
}

registerForm.onsubmit=(event)=>{
    var name=document.getElementById('registerName').value;
    if(name){ 
         event.preventDefault();
         getDB.ref("users/"+name).get().then((sn)=>{
            if(sn.exists()){
                alert('Tên tài khoản đã tồn tại, vui lòng chọn tên khác')
            }else{
                getDB.ref("users/"+name).set({
                    name:name,
                    score:0,
                    permission:1,
                })
                alert('Đăng ký thành công, hãy đăng nhập')
                showLoginForm()
            }
         })
    }else{

    }     
}


/*function read(){
const chats=document.getElementById('chats');
chatsRef.on('child_added', function(snapshot) { 
    let html=`<div style="display:none" class="item">
    <div class="header">${snapshot.val().name}</div>
    <div class="content">
    <div class="ui label">
    ${snapshot.val().content}
    </div>
    </div>
    </div>`
    //chats.insertAdjacentHTML('beforeend',html)
    $('#chats').append(html)
    $('#chats .item').fadeIn()
});

}

read()

const test=()=>{
    
}*/