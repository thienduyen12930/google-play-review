const fs = require("fs");

const {

Document,

Packer,

Paragraph

}=require("docx");

async function saveWord(
text,
file
){

const doc=

new Document({

sections:[{

children:

text
.split("\n")
.map(
t=>
new Paragraph(t)
)

}]

});

const buffer=

await Packer.toBuffer(doc);

fs.writeFileSync(
file,
buffer
);

}

module.exports={

saveWord

};