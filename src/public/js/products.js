console.log("Products frontend javascript file");

$(function () {
  $(".product-collection").on("change", () => {
    const selectedValue = $(".product-collection").val();

    if (selectedValue === "CAKE") {
      $("#product-collection").hide();
      $("#product-volume").show();
    } else {
      $("#product-volume").hide();
      $("#product-collection").show();
    }
  });

  $(function () {
    // Open Product Form
    $("#product-btn").on("click", () => {
      $(".pro-form").slideToggle(500);
      $("#product-btn").hide();
    });

    // Cancel Product Form
    $("#product-cancel-btn").on("click", () => {
      $(".pro-form").slideToggle(100);
      $("#product-btn").show();
    });

    // Open Flavor Form
    $("#flavor-btn").on("click", () => {
      $(".taste-form").slideToggle(500);
      $("#flavor-btn").hide();
    });

    // Cancel Flavor Form
    $("#flavor-cancel-btn").on("click", () => {
      $(".taste-form").slideToggle(100);
      $("#flavor-btn").show();
    });
  });

  $(".new-product-status").on("change", async function (e) {
    const id = e.target.id;
    const status = $(`#${id}.new-product-status`).val();
    const type = $(this).data("type"); // Get whether it's 'product' or 'flavor'

    console.log("id:", id);
    console.log("status:", status);
    console.log("type:", type);

    try {
      let url = "";
      let payload = {};

      if (type === "product") {
        url = `/adminRouter/product/${id}`;
        payload = { productStatus: status };
      } else if (type === "flavor") {
        url = `/adminRouter/flavor/${id}`;
        payload = { flavorStatus: status };
      }

      const response = await axios.post(url, payload);
      const result = response.data;

      if (result.data) {
        console.log(`${type} updated successfully!`);
        $(this).blur();
      } else {
        alert(`${type} update failed!`);
      }
    } catch (error) {
      console.log(`error ${type}Status:`, error);
      alert(`${type} update failed!`);
    }
  });
});

function validateProductForm() {
  const productName = $("#product-form .product-name").val();
  const productPrice = $("#product-form .product-price").val();
  const productLeftCount = $("#product-form .product-left-count").val();
  const productCollection = $("#product-form .product-collection").val();
  const productDesc = $("#product-form .product-desc").val();
  const productStatus = $("#product-form .product-status").val();

  if (
    !productName ||
    !productPrice ||
    !productLeftCount ||
    !productDesc ||
    !productStatus ||
    !productCollection
  ) {
    alert("Please fill out all required product fields.");
    return false;
  }
  return true;
}

function validateFlavorForm() {
  const flavorName = $("#flavor-form .product-name").val();
  const flavorType = $("#flavor-form .product-collection").val();
  const flavorStatus = $("#flavor-form .product-status").val();

  if (!flavorName || !flavorType || !flavorStatus) {
    alert("Please fill out all required flavor fields.");
    return false;
  }
  return true;
}

function previewFileHandler(input, order) {
  const imgClassName = input.className;
  const file = $(`.${imgClassName}`).get(0).files[0];
  const fileType = file?.type;
  const validImageType = ["image/jpg", "image/jpeg", "image/png"];

  if (!validImageType.includes(fileType)) {
    alert("Please insert only jpg, jpeg or png!");
    return;
  }

  if (file) {
    const reader = new FileReader();
    reader.onload = function () {
      $(`#image-section-${order}`).attr("src", reader.result);
    };
    reader.readAsDataURL(file);
  }
}

function previewFileHandlerForFlavor(input) {
  const file = input.files[0];
  const fileType = file?.type;
  const validImageType = ["image/jpg", "image/jpeg", "image/png"];

  if (!validImageType.includes(fileType)) {
    alert("Please insert only jpg, jpeg or png!");
    return;
  }

  if (file) {
    const reader = new FileReader();
    reader.onload = function () {
      $("#flavor-image-1").attr("src", reader.result);
    };
    reader.readAsDataURL(file);
  }
}
