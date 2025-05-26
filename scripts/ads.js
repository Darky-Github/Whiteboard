const adsData = [
  { title: 'Ad 1', description: 'Great product for your needs.' },
  { title: 'Ad 2', description: 'Try our service today.' },
  { title: 'Ad 3', description: 'Special discount available now!' }
];

const adContainer = document.getElementById('ad-container');

adsData.forEach(ad => {
  const adDiv = document.createElement('div');
  adDiv.innerHTML = `<strong>${ad.title}</strong><p>${ad.description}</p>`;
  adContainer.appendChild(adDiv);
});
