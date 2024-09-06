

//This shorthand is equivalent to $(document).ready(function(){}) and calls the function inside after the page is fully loaded.
$(function(){
	var current=0;
	var images = ['img/UDMonogramC.jpg','img/struttinYDC.jpg'];

	//This adds a "click" event handler to the element with the id "change-image". When the element is clicked, the function inside is called.
	$('#change-image').on('click', function(){

		//This is a ternary operator, it is a shorthand for an if else statement. It is equivalent to: if(current==0){current=1;}else{current=0;}
		current=(current+1)%2;

		//This uses current to select an image page from the images array defined at the top.
		$('#ud-image').attr('src', images[current]);
	});
})