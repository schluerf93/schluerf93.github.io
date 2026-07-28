/* ==========================================================
   IMKER PATRICK OBERDANNER
   Warenkorb Logik
========================================================== */


let cart = JSON.parse(localStorage.getItem("honeyCart")) || [];

const SHIPPING_COST = 5.90;

/* ==========================================================
   PRODUKTE HINZUFÜGEN
========================================================== */


document.addEventListener("DOMContentLoaded", () => {


    const buttons = document.querySelectorAll(".add-to-cart");


    buttons.forEach(button => {


        button.addEventListener("click", () => {


            const product = {

                name: button.dataset.name,

                price: Number(button.dataset.price),

                quantity: 1

            };


            addToCart(product);


        });


    });

    const orderForm =
        document.getElementById("orderForm");


    if(orderForm){


        orderForm.addEventListener("submit", () => {

            fillOrderForm();

        });


    }
    updateCart();

    if(!window.paypal){

    console.error(
    "PayPal SDK nicht geladen"
    );

    return;

    }

    paypal.Buttons({



    createOrder:function(data, actions){



        return actions.order.create({

            purchase_units:[{

                amount:{

                    value:
                    getPaypalAmount()

                },

                description:
                "Honigbestellung Imker Patrick Oberdanner"


            }]

        });


    },



    onApprove:function(data, actions){



        return actions.order.capture()
        .then(function(details){



            console.log(
            "Zahlung erfolgreich",
            details
            );



            prepareOrderData();



            document
            .getElementById("orderForm")
            .submit();



            alert(
            "Vielen Dank für deine Bestellung!"
            );



        });



    },



    onError:function(err){


        console.error(
        err
        );


        alert(
        "Die Zahlung konnte nicht abgeschlossen werden."
        );


    }



    }).render(
    "#paypal-button-container"
    );
});


function addToCart(product){


    const existing =
        cart.find(item => item.name === product.name);



    if(existing){


        existing.quantity++;


    }
    else {


        cart.push(product);


    }


    saveCart();


    updateCart();


    showCartNotification(product.name);


}



/* ==========================================================
   CART SPEICHERN
========================================================== */


function saveCart(){

    localStorage.setItem(
        "honeyCart",
        JSON.stringify(cart)
    );

}



/* ==========================================================
   WARENKORB DARSTELLEN
========================================================== */


function updateCart(){


    const container =
        document.getElementById("cartItems");


    if(!container)
        return;



    container.innerHTML="";


    if(cart.length === 0){


        container.innerHTML = `

            <p class="empty-cart">
                Dein Warenkorb ist noch leer.
            </p>

        `;


    }
    else {



        cart.forEach((item,index)=>{


            const element =
            document.createElement("div");


            element.className =
            "cart-item";



            element.innerHTML = `


                <div class="cart-item-info">

                    <h4>
                        ${item.name}
                    </h4>


                    <p>
                        ${formatEuro(item.price)}
                    </p>

                </div>


                <div class="cart-controls">


                    <button onclick="changeQuantity(${index}, -1)">
                        −
                    </button>


                    <span>
                        ${item.quantity}
                    </span>


                    <button onclick="changeQuantity(${index}, 1)">
                        +
                    </button>


                    <button class="remove"
                            onclick="removeItem(${index})">

                        🗑

                    </button>


                </div>



            `;


            container.appendChild(element);



        });


    }



    updateSummary();

    updateCartCount();


}



/* ==========================================================
   MENGE ÄNDERN
========================================================== */


function changeQuantity(index, amount){


    cart[index].quantity += amount;



    if(cart[index].quantity <= 0){


        cart.splice(index,1);


    }


    saveCart();

    updateCart();


}




/* ==========================================================
   ARTIKEL ENTFERNEN
========================================================== */


function removeItem(index){


    cart.splice(index,1);


    saveCart();

    updateCart();


}




/* ==========================================================
   SUMMEN
========================================================== */


function getSubtotal(){


    return cart.reduce(

        (sum,item)=>

        sum + item.price * item.quantity,

        0

    );

}




function getShipping() {

    const delivery =
        document.querySelector('input[name="delivery"]:checked');


    if (!delivery) {
        return 0;
    }


    return delivery.value === "shipping"
        ? SHIPPING_COST
        : 0;

}

function getShippingOption(){


    const selected =
    document.querySelector(
        'input[name="delivery"]:checked'
    );



    if(selected &&
       selected.value === "Abholung"){


        return "Nein";


    }


    return "Ja";


}

/* function getPayment(){


    const selected =
    document.querySelector(
        'input[name="payment"]:checked'
    );



    if(selected &&
       selected.value === "banktransfer"){


        return "Banktransfer";


    }


    return 0;


} */




function getTotal(){


    return getSubtotal()
        + getShipping();


}




function updateSummary(){


    const subtotal =
    document.getElementById("subtotal");


    const shipping =
    document.getElementById("shipping");


    const total =
    document.getElementById("total");



    if(subtotal){


        subtotal.innerText =
        formatEuro(getSubtotal());


    }



    if(shipping){


        shipping.innerText =
        formatEuro(getShipping());


    }



    if(total){


        total.innerText =
        formatEuro(getTotal());


    }



    updateCheckoutSummary();


}




/* ==========================================================
   CHECKOUT ÜBERSICHT
========================================================== */


function updateCheckoutSummary(){


    const container =
    document.getElementById(
        "checkoutItems"
    );


    if(!container)
        return;



    container.innerHTML="";



    cart.forEach(item=>{


        container.innerHTML += `

            <p>

            ${item.quantity}x
            ${item.name}

            <span>
            ${formatEuro(
                item.price * item.quantity
            )}

            </span>

            </p>

        `;


    });



    const total =
    document.getElementById(
        "checkoutTotal"
    );



    if(total){


        total.innerText =
        formatEuro(getTotal());


    }



}

function fillOrderForm() {

    const orderField = document.getElementById("orderData");
    const totalField = document.getElementById("orderTotal");
    const orderShipping = document.getElementById("orderShipping");
    /* const orderPayment = document.getElementById("orderPayment"); */


    if (!orderField || !totalField || !orderShipping) {
        return;
    }


    let orderText = cart.map(item => {

        return `${item.quantity}x ${item.name}`;

    }).join("\n");



    orderField.value = orderText;


    totalField.value = formatEuro(getTotal());

    orderShipping.value = getShippingOption();
    /* orderPayment.value = getPayment(); */

}





/* ==========================================================
   CART COUNTER HEADER
========================================================== */


function updateCartCount(){


    const counter =
    document.getElementById(
        "cartCount"
    );


    if(!counter)
        return;



    const amount =
    cart.reduce(
        (sum,item)=>
        sum + item.quantity,
        0
    );


    counter.innerText =
    amount;



}



/* ==========================================================
   VERSAND ÄNDERN
========================================================== */


document.addEventListener(
"change",
event=>{


    if(
        event.target.name === "delivery"
    ){


        updateSummary();


    }


});



/* ==========================================================
   HILFSFUNKTIONEN
========================================================== */


function formatEuro(value){


    return value
        .toFixed(2)
        .replace(".",",")
        +" €";


}




function showCartNotification(name){


    const notification =
    document.createElement("div");


    notification.className =
    "cart-notification";


    notification.innerText =
    `${name} wurde hinzugefügt 🍯`;



    document.body.appendChild(notification);



    setTimeout(()=>{


        notification.classList.add(
            "show"
        );


    },50);



    setTimeout(()=>{


        notification.classList.remove(
            "show"
        );


        setTimeout(()=>{

            notification.remove();

        },300);


    },2500);


}

function prepareOrderData(){


    let orderText = cart.map(item => {


        return `${item.quantity}x ${item.name}`;


    }).join("\n");



    document.getElementById("orderData").value =
        orderText;



    document.getElementById("orderTotal").value =
        getTotal().toFixed(2);



    /* document.getElementById("orderPayment").value =
        "PayPal"; */



    document.getElementById("orderShipping").value =
        getShippingCost() > 0
        ? "Versand 5,90 €"
        : "Abholung Axams";


}

function getPaypalAmount(){


    return getTotal()
        .toFixed(2);


}
