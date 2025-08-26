console.log("Products frontend javascript file");

$(function () {
  // Toggle Button Functionality
  $("#cafe-menu-btn").on("click", function () {
    // Show cafe menu section
    $(".cafe-menu-section").addClass("active");
    $(".flavor-list-section").removeClass("active");

    // Update button states
    $(this).addClass("active");
    $("#flavor-list-btn").removeClass("active");
  });

  $("#flavor-list-btn").on("click", function () {
    // Show flavor list section
    $(".flavor-list-section").addClass("active");
    $(".cafe-menu-section").removeClass("active");

    // Update button states
    $(this).addClass("active");
    $("#cafe-menu-btn").removeClass("active");
  });

  $(".product-collection").on("change", () => {
    const selectedValue = $(".product-collection").val();

    if (selectedValue === "CAKE") {
      $("#product-collection").hide();
      $("#cakeSize").show();
    } else {
      $("#cakeSize").hide();
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
  const flavorPrice = $("#flavor-form .product-price").val();
  const flavorCollection = $("#flavor-form .product-collection").val();
  const flavorStatus = $("#flavor-form .product-status").val();

  if (!flavorName || !flavorPrice || !flavorCollection || !flavorStatus) {
    alert("Please fill out all required flavor fields.");
    return false;
  }

  // Validate price is a positive number
  const price = parseFloat(flavorPrice);
  if (isNaN(price) || price <= 0) {
    alert("Please enter a valid price greater than 0.");
    return false;
  }

  return true;
}

// New function to handle flavor form submission
async function submitFlavorForm() {
  if (!validateFlavorForm()) {
    return;
  }

  const flavorName = $("#flavor-form .product-name").val();
  const flavorPrice = parseFloat($("#flavor-form .product-price").val());
  const flavorCollection = $("#flavor-form .product-collection").val();
  const flavorStatus = $("#flavor-form .product-status").val();

  // Handle file upload
  const flavorImageFile = $("#flavor-form .image-one")[0].files[0];

  try {
    const formData = new FormData();
    // Use proper Flavor schema field names
    formData.append("flavorName", flavorName);
    formData.append("flavorPrice", flavorPrice.toString());
    formData.append("flavorCollection", flavorCollection);
    formData.append("flavorStatus", flavorStatus);

    if (flavorImageFile) {
      formData.append("flavorImage", flavorImageFile);
    }

    const response = await axios.post("/adminRouter/flavor/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const result = response.data;

    if (result.data) {
      alert("Flavor created successfully!");
      resetFlavorForm();
      $(".taste-form").slideToggle(100);
      $("#flavor-btn").show();
      // Optionally reload the page or update the flavors list
      location.reload();
    } else {
      alert("Failed to create flavor!");
    }
  } catch (error) {
    console.error("Error creating flavor:", error);
    alert("Failed to create flavor. Please try again.");
  }
}

// Function to reset the flavor form
function resetFlavorForm() {
  $("#flavor-form .product-name").val("");
  $("#flavor-form .product-price").val("");
  $("#flavor-form .product-collection").val("ICECREAM"); // Reset to default
  $("#flavor-form .product-status").val("AVAILABLE"); // Reset to default
  $("#flavor-form .image-one").val("");

  // Reset image preview if it exists
  const imagePreview = document.getElementById("image-flavor-1");
  if (imagePreview) {
    imagePreview.src = "/img/upload.svg"; // Reset to upload icon
  }
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
  if (!file) {
    console.error("No file selected");
    return;
  }

  const fileType = file.type;
  const validImageTypes = ["image/jpeg", "image/jpg", "image/png"];

  if (!validImageTypes.includes(fileType)) {
    alert("Please upload only JPG, JPEG, or PNG images!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const imageElement = document.getElementById("image-flavor-1");
    if (imageElement) {
      imageElement.src = e.target.result;
    } else {
      console.error("Image element with ID 'image-flavor-1' not found");
    }
  };
  reader.onerror = function () {
    console.error("Error reading file");
    alert("Failed to read the image file. Please try again.");
  };
  reader.readAsDataURL(file);
}
