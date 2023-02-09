let body = document.querySelector('body')
let input = document.querySelector('#inpBarcode')
let output = document.querySelector('#output')
let relatedProductDetails = document.querySelector('#related-product-details')
let productDetails = document.querySelector('#product-details')
let tableBody = document.querySelector('#table-body')
let btnSearch = document.querySelector('#search')
let errorMessage = document.querySelector('#error-message')

let readNDC = s => `${s.substr(0,5)}-${s.substr(5,4)}-${s.substr(9,2)}`

let padZeros = s => {
    console.log("Pad zeroes function")
    console.log(s)
    let first = "0"+s
    let second = s.substr(0,5) + "0" + s.substr(5,5)
    let third = s.substr(0,9) + "0" + s.substr(9,1)
    return [readNDC(first),readNDC(second),readNDC(third)]
}

async function queryNDCproperties(s) {
    let error = false
    let found = false
    if(s.length==13) s=s.split`-`.join('')

    let response = await fetch(`https://rxnav.nlm.nih.gov/REST/ndcproperties.json?id=${s}`)
    let data = await response.json()
    found = JSON.stringify(data) !== "{}"

    return { found, data, error }
}

async function queryNDC(s) {
    let error = false
    let found = false
    
    let response = await fetch(`https://rxnav.nlm.nih.gov/REST/relatedndc.json?relation=concept&ndc=${s}`)
    let data = await response.json()
    found = JSON.stringify(data) !== "{}"

    return { found, data, error }
}

async function populateProductDetails(ndc) {
    productDetails.innerHTML = '<h2>Product Details</h2>'
    let { found, data, error } = await queryNDCproperties(ndc)
    if(!found) return
    if(found) productDetails.style.display = 'block'    

    let table = document.createElement('table')
    let NDC = readNDC(data.ndcPropertyList.ndcProperty[0].ndcItem)
    let Status = data.ndcPropertyList.ndcProperty[0].propertyConceptList.propertyConcept.find(obj => obj.propName === "MARKETING_STATUS").propValue
    let Labeler = data.ndcPropertyList.ndcProperty[0].propertyConceptList.propertyConcept.find(obj => obj.propName === "LABELER").propValue
    let Packaging = data.ndcPropertyList.ndcProperty[0].packagingList.packaging

    table.innerHTML = `

    <thead>
        <tr>
            <th>NDC</th>
            <th>Status</th>
            <th>Labeler</th>
            <th>Packaging</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>${NDC}</td>
            <td>${Status}</td>
            <td>${Labeler}</td>
            <td>${Packaging.join("\n")}</td>
        </tr>
    </tbody>    
    `

    productDetails.appendChild(table)
}

async function populateRelatedProducts(ndc) {
    tableBody.innerHTML = ''
    let { found, data, error } = await queryNDC(ndc)    

    console.table({found,data,error})
    
    errorMessage.style.display = found ? 'none' : 'block'
    if (!found) return
    
    relatedProductDetails.style.display = 'block';

    data.ndcInfoList.ndcInfo = data.ndcInfoList.ndcInfo.sort((a,b)=>a.ndc11 - b.ndc11)

    let index = 1
    for(let product of data.ndcInfoList.ndcInfo){
        console.warn(product)
        let tr = document.createElement('tr')

        let tdIndex = document.createElement('td')
        tdIndex.innerText = index
        tdIndex.style.textAlign = 'right'
        tdIndex.style.fontSize = '0.75rem'
        tdIndex.style.fontWeight = 'bold'
        index++

        let ndc = document.createElement('td')
        ndc.style.fontFamily = "Courier New, Courier, monospace";
        let s = product.ndc11
        s = `${s.substr(0,5)}-${s.substr(5,4)}-${s.substr(9,2)}`
        ndc.innerText = s

        let status = document.createElement('td')
        status.innerText = product.status.toLowerCase()
        status.style.textAlign = 'center'

        let conceptName = document.createElement('td')
        conceptName.innerText = product.conceptName
        
        tr.appendChild(tdIndex)
        tr.appendChild(ndc)
        tr.appendChild(status)
        tr.appendChild(conceptName)

        tableBody.appendChild(tr)
    }
}


async function calculateNDCs (e) {
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
    productDetails.style.display = 'none'
    relatedProductDetails.style.display = 'none'
    tableBody.innerHTML = ""

    for (let s of arr) {
        let { found, data, error } = await queryNDC(s)

        if(error) {
            console.log(error)
            continue;
        }
        
        console.log(data)

        let i = document.createElement('input')
        i.style.display = 'block'
        i.value = s

        if (found) populateProductDetails(s)
        if (found) populateRelatedProducts(s)
            
        i.style.background = found ? '#d6f5d6' : '#ffe6e6' 
        // lightgreen: '#d6f5d6'
        // lightred: '#ffe6e6'
        
        output.appendChild(i)   
    }
}

input.addEventListener('change', calculateNDCs)
input.addEventListener('click', calculateNDCs)

body.addEventListener('click', e => {
    console.log(e.target.nodeName)
    if (e.target.nodeName=='INPUT') {
        e.target.select()
    }
})

btnSearch.addEventListener('click', () => {
    let ndc = document.getElementById('inpNDC').value
    populateRelatedProducts(ndc)
})

// readNDC("12345678901")