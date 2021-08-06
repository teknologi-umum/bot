const list = [
  '/covid us',
  '/covid@TeknologiUmumBot canava',
  'asd /covid'
]

for (let item of list) {
  let re = new RegExp('^/covid@TeknologiUmumBot|/covid')
  console.log(item.replace(re, '').trim());
}