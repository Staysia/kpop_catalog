document.addEventListener('DOMContentLoaded', function () {
    const productListDiv = document.getElementById('product-list');
    const categoryNav = document.getElementById('category-nav');
     const adminLinkButton = document.getElementById('admin-link');
      const catalogLinkButton = document.getElementById('catalog-link');

      const modal = document.getElementById('modal');
    const closeModalButton = document.querySelector('.close');

        const adminProductListDiv = document.getElementById('admin-product-list');
         const addProductForm = document.getElementById('add-product-form');
          const productCategorySelect = document.getElementById('product-category');
          const productSubcategorySelect = document.getElementById('product-subcategory');


    let products = [];
    let categories = {};
    let comments = [];

    function loadData() {
        Promise.all([
            fetch('data/products.json').then(res => res.json()),
            fetch('data/categories.json').then(res => res.json()),
            fetch('data/comments.json').then(res => res.json())
        ]).then(([productData, categoryData, commentData]) => {
            products = productData;
            categories = categoryData;
            comments = commentData;
             renderCategoryNavigation();
             renderProducts();
              if(adminProductListDiv) {
                 renderAdminProductList();
               }

               if(productCategorySelect && productSubcategorySelect){
                 populateCategories();
                  productCategorySelect.addEventListener('change', populateSubcategories);
               }

        }).catch(error => console.error('Error loading data:', error));
    }

  function  populateCategories() {
     for (const categoryId in categories) {
         const category = categories[categoryId];
            const option = document.createElement('option');
            option.value = categoryId;
             option.textContent = category.name;
            productCategorySelect.appendChild(option);
        }
      }

    function populateSubcategories() {
      productSubcategorySelect.innerHTML = '';
       const categoryId = productCategorySelect.value;
        if (categoryId && categories[categoryId] && categories[categoryId].subcategories) {
           for (const subcategoryId in categories[categoryId].subcategories) {
              const subcategory = categories[categoryId].subcategories[subcategoryId];
                const option = document.createElement('option');
                option.value = subcategoryId;
                option.textContent = subcategory;
               productSubcategorySelect.appendChild(option);
            }
          }
    }

    function renderCategoryNavigation() {
      if(categoryNav) {
        categoryNav.innerHTML = '';
         for (const categoryId in categories) {
            const category = categories[categoryId];
            const link = document.createElement('a');
           link.href = '#';
           link.textContent = category.name;
            link.addEventListener('click', () => renderProducts(categoryId));
           categoryNav.appendChild(link);
         }
     }
    }
function displayModal(productId) {
        modal.style.display = 'block';

     const modalProductDetailsDiv = document.getElementById('modal-product-details');
     const commentListDiv = document.getElementById('comment-list');
       const product = products.find(p => p.id === productId);
    if (product) {
        modalProductDetailsDiv.innerHTML = `
             <h2>${product.name}</h2>
                 <img src="${product.mainImage}" alt="${product.name}">
                <p>${product.description}</p>
                <div class="gallery">
                    ${product.additionalImages.map(img => `<img src="${img}" alt="${product.name} image">`).join('')}
                </div>
            `;
    }

     commentListDiv.innerHTML = '';
      const productComments = comments.filter(comment => comment.productId === productId);
         renderComments(productComments, commentListDiv);

          const newCommentTextarea = document.getElementById('new-comment-text');
            const postCommentButton = document.getElementById('post-comment');
             postCommentButton.onclick = function() {
               const commentText = newCommentTextarea.value.trim();
                   if(commentText) {
                         const newComment = {
                              id: Date.now(),
                              productId: productId,
                               parentId: null,
                              text: commentText,
                              timestamp: new Date().toISOString()
                           };
                        comments.push(newComment);
                      saveComments();
                   renderComments(comments.filter(comment => comment.productId === productId), commentListDiv);
                        newCommentTextarea.value = '';
                    }
                };

    }


      function renderComments(commentArray, container, parentId = null, level = 0) {
           commentArray.filter(comment => comment.parentId === parentId).forEach(comment => {
              const commentDiv = document.createElement('div');
                commentDiv.classList.add('comment');
                 commentDiv.style.marginLeft = `${level * 20}px`;
                commentDiv.innerHTML = `<p>${comment.text}</p>
                 <span class="comment-timestamp">${new Date(comment.timestamp).toLocaleString()}</span>`;
                 const replyForm = document.createElement('div');
                  replyForm.classList.add('comment-reply-form');
                  const replyTextarea = document.createElement('textarea');
                  replyTextarea.placeholder = 'Ответить на комментарий';
                 const replyButton = document.createElement('button');
                 replyButton.textContent = 'Ответить';

                replyButton.onclick = () => {
                     const replyText = replyTextarea.value.trim();
                    if(replyText) {
                        const newReply = {
                            id: Date.now(),
                            productId: comment.productId,
                            parentId: comment.id,
                            text: replyText,
                            timestamp: new Date().toISOString()
                         };
                         comments.push(newReply);
                          saveComments();
                      renderComments(comments.filter(c => c.productId === comment.productId), container, parentId, level);
                       replyTextarea.value = '';
                        }
                    };
               replyForm.appendChild(replyTextarea);
               replyForm.appendChild(replyButton);
                commentDiv.appendChild(replyForm);
               container.appendChild(commentDiv);

              renderComments(commentArray, container, comment.id, level + 1);
            });
        }

    function saveComments() {
      fetch('data/comments.json', {
        method: 'POST',
          headers: {
            'Content-Type': 'application/json'
        },
         body: JSON.stringify(comments)
    }).catch(error => console.error('Error saving comments:', error));
      }

    function renderProducts(categoryId = null) {
      if (productListDiv) {
          productListDiv.innerHTML = '';
           const filteredProducts = categoryId ? products.filter(product => product.categoryId === categoryId) : products;

            filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
           productCard.innerHTML = `
                <h2>${product.name}</h2>
                <img src="${product.mainImage}" alt="${product.name}">
                <button class="view-product" data-product-id="${product.id}">Подробнее</button>
                <p>Цена: ${product.price} руб.</p>
            `;
             productListDiv.appendChild(productCard);
         });

        const viewProductButtons = document.querySelectorAll('.view-product');
             viewProductButtons.forEach(button => {
               button.onclick = function() {
                const productId = parseInt(this.getAttribute('data-product-id'));
                  displayModal(productId)
                }
            });
        }
    }

    function renderAdminProductList() {
      if(adminProductListDiv) {
        adminProductListDiv.innerHTML = '';
          products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.classList.add('product-card');
                 productDiv.innerHTML = `
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                      <img src="${product.mainImage}" alt="${product.name}" class="product-image">
                      <p>Цена: ${product.price} руб.</p>
                    `;
                adminProductListDiv.appendChild(productDiv);
            });
        }
    }

    function applyWatermark(file) {
      return new Promise((resolve, reject) => {
            const reader = new FileReader();
               reader.onload = function(event) {
                   const img = new Image();
                 img.src = event.target.result;
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                         canvas.width = img.width;
                         canvas.height = img.height;
                         const ctx = canvas.getContext('2d');
                          ctx.drawImage(img, 0, 0);
                         ctx.font = '30px Arial';
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        ctx.textAlign = 'center';
                         ctx.textBaseline = 'middle';
                       ctx.fillText('WATERMARK', canvas.width / 2, canvas.height / 2);
                     canvas.toBlob(blob => {
                          resolve(blob);
                         }, 'image/png')
                      };
                        img.onerror = reject;
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
         });
     }


  if(addProductForm){
     addProductForm.onsubmit = async function(event) {
       event.preventDefault();
         const productName = document.getElementById('product-name').value;
         const productDescription = document.getElementById('product-description').value;
          const categoryId = document.getElementById('product-category').value;
         const subcategoryId = document.getElementById('product-subcategory').value;
            const mainImageFile = document.getElementById('main-image').files[0];
           const additionalImageFiles = document.getElementById('additional-images').files;

            const watermarkedMainImageBlob = await applyWatermark(mainImageFile);
              const watermarkedMainImageName = `watermarked_${Date.now()}_${mainImageFile.name}`;
             saveImage(watermarkedMainImageBlob, watermarkedMainImageName);


             const watermarkedAdditionalImages = await Promise.all(
             Array.from(additionalImageFiles).map(async (file, index) => {
                const watermarkedBlob = await applyWatermark(file);
                 const watermarkedFileName = `watermarked_${Date.now()}_${index}_${file.name}`;
                 saveImage(watermarkedBlob, watermarkedFileName)
                  return watermarkedFileName;
                   })
            );

               const newProduct = {
                    id: Date.now(),
                    name: productName,
                    description: productDescription,
                    price: productPrice,
                     categoryId: categoryId,
                    subcategoryId: subcategoryId,
                     mainImage: watermarkedMainImageName,
                    additionalImages: watermarkedAdditionalImages,
                   };
                 products.push(newProduct);
             saveProducts();
               renderAdminProductList();
                 addProductForm.reset();
          }

       }

    function saveImage(blob, fileName) {
       const formData = new FormData();
          formData.append('image', blob, fileName);

         fetch('upload.php', {
              method: 'POST',
                body: formData
          }).then(response => {
            if(!response.ok){
               throw new Error("HTTP error, status = " + response.status);
             }
              return response.json();
          }).then(data => {
              console.log("Image uploaded: ", data);
            }).catch(error => console.error('Error uploading image:', error));
    }


       function saveProducts() {
         fetch('data/products.json', {
           method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
             body: JSON.stringify(products)
      }).catch(error => console.error('Error saving products:', error));
    }


    if(adminLinkButton) {
         adminLinkButton.onclick = () => {
             window.location.href = 'admin.html';
          };
      }
     if(catalogLinkButton){
        catalogLinkButton.onclick = () => {
           window.location.href = 'index.html';
      }
     }

   if(closeModalButton) {
        closeModalButton.onclick = function() {
            modal.style.display = "none";
      };

      window.onclick = function(event) {
          if (event.target === modal) {
              modal.style.display = "none";
           }
      };
    }
   loadData();
});