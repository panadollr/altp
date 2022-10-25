const getDB= firebase.database()
var usersRef = getDB.ref('users');
var serverRef = getDB.ref('server');
const userTable = document.getElementById('user_table');


const loadUserList=()=>{
    usersRef.orderByChild('score').on('value',function(snapshot){
        let user=``
snapshot.forEach(element=>{
    user+=` <tr>
    <td>${element.val().name}</td>
    <td>${element.val().score}</td>
    <td><button data-permission="${element.val().permission}" data-name="${element.val().name}" `
    if(element.val().permission==1){
        user+=`class="ui button red ban">Khóa tài khoản`
    }else{
        user+=`class="ui button green ban">Mở khóa tài khoản`
    }
   user+= `</button></td></tr>`
})      
$('#user_table tbody').html(user)
$('#user_table tbody .ban').click(function(){
    const userRefByName= getDB.ref('users/'+$(this).data('name'))
    if($(this).data('permission')==1){
        userRefByName.update({
            permission:0  
          })
    }else{
        userRefByName.update({
            permission:1  
          })
    }
})
    })
}

loadUserList()

serverRef.on('value',(el)=>{
    $('.checkbox').checkbox('set enabled');
    if(el.val().active==true){
        $('#user_table tbody .ban').removeClass('disabled')
        $('.checkbox').css('border','3px solid #2185d0').checkbox('set checked')
        $('.checkbox span').text(': Bật')
    }else{
        $('#user_table tbody .ban').addClass('disabled')
        $('.checkbox').css('border','3px solid black').checkbox('set unchecked');
        $('.checkbox span').text(': Tắt')
    }
})

const updateServer=(active)=>{
    serverRef.set({
        active:active
    })
}

$('.checkbox')
  .checkbox()
  .first().checkbox({
    onChecked: function() {
      updateServer(true)
    },
    onUnchecked: function() {
        updateServer(false)
    },
})