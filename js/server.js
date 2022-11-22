const getDB= firebase.database()
var usersRef = getDB.ref('users');
var serverRef = getDB.ref('server');
const userTable = document.getElementById('user_table');

const loadUserList=()=>{

    usersRef.on('value',(snapshot)=>{
    const userArr=[]
    snapshot.forEach(el=>{
        userArr.push(el.val())
    })
        userArr.sort((a, b) => {
            let idA=a.score
            let idB=b.score
             return idA==idB ? 0 : idA < idB ? 1 : -1;
          });

          let order=0;
          let user=``
          userArr.forEach(element=>{
              user+=` <tr>
              <td>${order+=1}`
              if(order==1){
user+=`<i class="fire alternate red large icon"></i>`
              }else if(order==2){
                user+=`<i class="fire alternate orange large icon"></i>`
              }else if(order==3){
                user+=`<i class="fire alternate green large icon"></i>`
              }
             user+=`</td>
              <td>${element.name}</td>
              <td>${element.score}/12</td>
              <td><button data-permission="${element.permission}" data-name="${element.name}" `
              if(element.permission==1){
                  user+=`class="ui button orange ban">Khóa`
              }else{
                  user+=`class="ui button green ban">Mở khóa`
              }
             user+= `</button><button data-name="${element.name}" class="ui red delete button">Xóa</button></td>
             </tr>`
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
          
          $('#user_table tbody .delete').click(function(){
              var user_name=$(this).data('name');
              let text = "Bạn chắc chắn muốn xóa tài khoản "+user_name+" ?";
              if (confirm(text) == true) {
                  getDB.ref('users/'+user_name).remove()
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