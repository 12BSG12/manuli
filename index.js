const pageList = document.getElementById('page-list');
const input = document.querySelector('.input');
const formInputFile = document.querySelector('.formInputFile');
const alertMessage = document.querySelector('.alertMessage');
const closeAlert = document.querySelector('.closeAlert');
const customAlert = document.querySelector('.alert');
const alertTitle = document.querySelector('.alertTitle');
const spinnerForm = document.getElementById('spinnerForm');
const spinnerBody = document.getElementById('spinnerBody');
const authFormInputText = document.getElementById('authFormInputText');
const addFormInputText = document.getElementById('addFormInputText');
const pdfView = document.querySelector('.pdfView');

let isAuth = false;

const options = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: 'OAuth y0_AgAEA7qkYPVyAADLWwAAAADhLLQ7cgDqA5SkR2-rxmkIHqZYyyQXdU8',
  },
};

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
  const response = await fetch(
    `https://cloud-api.yandex.net/v1/disk/resources?path=${path}`,
    options,
  );
  const json = await response.json();

  return json;
};

const loadCards = async () => {
  try {
    spinnerBody.style.display = 'block';

    const json = await fetching();

    json._embedded.items.forEach(async (item) => {
      const path = item.path.replace('disk:/', '');
      const cardJson = await fetching(path);
      const obj = {};

      cardJson._embedded.items.forEach((el) => {
        if (el.media_type === 'image') {
          obj.src = el.file;
        }

        if (el.media_type === 'document') {
          const fileName = el.name.replace(/\..*/, '');
          const path = 'https://docs.yandex.ru/docs/view?url=ya-disk-public://';
          const file = el.path.split('/').pop();
          const href = `${path}${encodeURIComponent(el.public_key)}&name=${encodeURIComponent(
            file,
          )}`;
          obj.path = href;
          obj.href = el.public_url;
          obj.fileName = fileName;
        }
      });

      pageList.innerHTML += `
        <div class="cartItem">
          <a href="${obj.path}" target="_blank">
            <img src="${obj.src}" />
            <p class="subTitle">
              ${obj.fileName}
            </p>
          </a>
        </div>
      `;

      pdfView.innerHTML += `
        <iframe
          src="https://getfile.dokpub.com/js/pdfjs/web/viewer.php?fl=${obj.href}"
        ></iframe>
      `;
    });
  } catch (error) {
    console.log(error);
  } finally {
    spinnerBody.style.display = 'none';
  }
};

loadCards();

const toggleBtn = document.querySelector('.toggleBtn');
const form = document.querySelector('.form');

toggleBtn.addEventListener('click', () => {
  if (!isAuth) {
    form.classList.toggle('formActive');
  } else {
    form.classList.toggle('formAddActive');
  }
  toggleBtn.classList.toggle('toggleBtnActive');
});

const formBtn = document.getElementById('addFormBtn');

formBtn.addEventListener('click', (e) => {
  e.preventDefault();

  if (addFormInputText.value && [...formInputFile.files].length > 0) {
    formBtn.disabled = true;
    spinnerForm.style.display = 'block';
    createFolderInYandexDisk();
  } else {
    alertTitle.innerHTML = 'Ошибка!';
    alertMessage.innerHTML = 'Выберите файлы для загрузки!';
    customAlert.style.right = '10px';
  }
});

closeAlert.addEventListener('click', (e) => {
  e.preventDefault();
  customAlert.style.right = '-100%';
});

addFormInputText.addEventListener('input', (e) => {
  if (e.target.value) {
    formBtn.disabled = false;
  } else {
    formBtn.disabled = true;
  }
});

const createFolderInYandexDisk = async () => {
  const responseCreateUrl = await fetch(
    `https://cloud-api.yandex.net/v1/disk/resources?path=manual/${addFormInputText.value}`,
    { method: 'PUT', ...options },
  );

  const createUrl = await responseCreateUrl.json();

  const res = await fetch(createUrl.href, options);
  const data = await res.json();

  setManualInYandexDisk(data.name);
};

const setManualInYandexDisk = (folderName) => {
  [...formInputFile.files].forEach(async (item) => {
    const responseUploadUrl = await fetch(
      `https://cloud-api.yandex.net/v1/disk/resources/upload?path=manual/${folderName}/${item.name}&overwrite=true`,
      options,
    );

    const uploadUrl = await responseUploadUrl.json();
    const reader = new FileReader();
    reader.readAsArrayBuffer(item);

    reader.addEventListener('load', async (e) => {
      const fileContent = e.target.result;

      const newOptions = {
        method: uploadUrl.method,
        headers: {
          'Content-Type': item.type,
        },
        body: fileContent,
      };

      const res = await fetch(uploadUrl.href, newOptions);

      if (res.ok) {
        console.log(`File ${item.name} was uploaded successfully`);
        publishFileInYandexDisk(`manual/${folderName}/${item.name}`);
      } else {
        console.log(`Failed to upload file ${item.name}: ${res.statusText}`);
      }
    });
  });
};

const publishFileInYandexDisk = async (path) => {
  const responsePublicUrl = await fetch(
    `https://cloud-api.yandex.net/v1/disk/resources/publish?path=${path}`,
    { method: 'PUT', ...options },
  );

  const publicUrl = await responsePublicUrl.json();

  const res = await fetch(publicUrl.href, options);

  if (res.ok) {
    spinnerForm.style.display = 'none';
    location.reload();
    const json = await res.json();
    console.log(json);
  }
};

let userEmail = '';

const getDiskInfo = async () => {
  const response = await fetch(`https://cloud-api.yandex.net/v1/disk/`, options);

  const data = await response.json();

  userEmail = data.user.login;
};

getDiskInfo();

const authFormBtn = document.getElementById('authFormBtn');
const addForm = document.getElementById('addForm');
const authForm = document.getElementById('authForm');

authFormBtn.addEventListener('click', (e) => {
  e.preventDefault();

  if (authFormInputText.value.toLowerCase() === userEmail.toLowerCase()) {
    isAuth = true;
    authForm.style.display = 'none';
    addForm.style.display = 'flex';
    form.classList.add('top-160');
    form.classList.add('h160');
    form.classList.remove('formActive');
    form.classList.add('formAddActive');
  }
});
