
//this function loads a confirmation 
//if c
function confirmBox() {
    var confirm;
  if (confirm("You're about to take a quiz.")) {
    confirm=true;
  } else {
    confirm = false;
  }
  //if confirm redirect to quiz page
  if(confirm==true){
    window.location.replace("quizPage.html")
  }else{
      //if cancel just exit confirm box
  }
}
