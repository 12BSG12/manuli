const pageList = document.getElementById('page-list');
const input = document.querySelector('.input');

input.addEventListener('input', (e) => {
  const filterValue = e.target.value.toLowerCase();

  [...pageList.children].forEach((item) => {
    if (item.textContent.toLowerCase().includes(filterValue)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
});

const fetching = async (path = 'manual') => {
  var options = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'OAuth y0_AgAEA7qkYPVyAADLWwAAAADhLLQ7cgDqA5SkR2-rxmkIHqZYyyQXdU8',
    },
  };
  const response = await fetch(
    `https://cloud-api.yandex.net/v1/disk/resources?path=${path}`,
    options,
  );
  const json = await response.json();

  return json;
};

const loadCard = async () => {
  const json = await fetching();

  json._embedded.items.forEach(async (item) => {
    const path = item.path.replace('disk:/', '');
    const cardJson = await fetching(path);
    console.log(cardJson);
    const obj = {};

    cardJson._embedded.items.forEach((el) => {
      if (el.media_type === 'image') {
        obj.src = el.preview;
      }

      if (el.media_type === 'document') {
        const fileName = el.name.replace(/\..*/, '');
        obj.href = el.public_url;
        obj.fileName = fileName;
      }
    });

    pageList.innerHTML += `
      <div class="cartItem">
        <a href="${obj.href}" target="_blank">
          <img src="${obj.src}" />
          <p class="subTitle">
            ${obj.fileName}
          </p>
        </a>
      </div>
    `;
  });
};

loadCard();
