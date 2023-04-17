const directoryPath = '/manuals';
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

// const readDirectory = async (directoryPath) => {
//   const response = await fetch(directoryPath);
//   const html = await response.text();
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(html, "text/html");

//   const entries = [...doc.querySelectorAll("a")].map((a) => a.href);

//   entries
//     .filter((item) => item.includes(`${directoryPath}/`))
//     .map((entry) => {
//       if (entry.endsWith(".html")) {
//         const fileName = entry.split("/").pop().replace(".html", "");

//         pageList.innerHTML += `
//           <div class="cartItem">
//             <a href="${entry}" target="_blank">
//               <img src="https://via.placeholder.com/500x120" />
//               <p class="subTitle">
//                 ${fileName}
//               </p>
//             </a>
//           </div>
//         `;
//       } else {
//         readDirectory(entry);
//       }
//     });
// };

// readDirectory(directoryPath);

const fetching = async () => {
  var options = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'OAuth y0_AgAEA7qkYPVyAADLWwAAAADhLLQ7cgDqA5SkR2-rxmkIHqZYyyQXdU8',
    },
  };
  const response = await fetch(
    'https://cloud-api.yandex.net/v1/disk/resources?path=manual',
    options,
  );
  const json = await response.json();
  console.log(json._embedded);
  json._embedded.items.forEach((item) => {
    console.log(item.preview);
    pageList.innerHTML += `
      <div class="cartItem">
        <a href="${item.preview}" target="_blank">
          <img src="${item.preview}" />
          <p class="subTitle">
            ${item.name}
          </p>
        </a>
      </div>
    `;
  });
};

fetching();
