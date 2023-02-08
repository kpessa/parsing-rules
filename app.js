let body = document.querySelector('body')
let input = document.querySelector('input')
let output = document.querySelector('#output')

let readNDC = s => `${s.substr(0,5)}-${s.substr(5,4)}-${s.substr(9,2)}`

let padZeros = s => {
    console.log("Pad zeroes function")
    console.log(s)
    let first = "0"+s
    let second = s.substr(0,5) + "0" + s.substr(5,5)
    let third = s.substr(0,9) + "0" + s.substr(9,1)
    return [readNDC(first),readNDC(second),readNDC(third)]
}

function calculateNDCs (e) {
    let n = input.value
    let s = String(n)
    let l = s.length

    if (l < 10) {
        output.innerHTML = ""
        let p = document.createElement('p')
        p.style.color = 'red'
        p.innerText = "Barcode must be atleast 10 numbers"
        output.appendChild(p)
        return
    }

    console.log(n,s,l)

    let arr = []
    if (l==11) arr = [readNDC(s)]
    else {
        if(l==12) s = s.substr(1,10);
        if(l==13) s = s.substr(2,10);
        if(l==14||l==15) s = s.substr(3,10)
        if(l==16||l==32||l==35||l==37) s = s.substr(5,10)

        arr = padZeros(s)
    }

    output.innerHTML = ""

    arr.forEach(s=>{
        let i = document.createElement('input')
        i.style.display = 'block'
        i.value = s
        output.appendChild(i)
    })
}

input.addEventListener('change', calculateNDCs)
input.addEventListener('click', calculateNDCs)

body.addEventListener('click', e => {
    console.log(e.target.nodeName)
    if (e.target.nodeName=='INPUT') {
        e.target.select()
    }
})

// readNDC("12345678901")