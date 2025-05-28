import "./style.scss";

const PageContact = () => {
  return (
    <>
    <h2 className="title">LIÊN HỆ VỚI CHÚNG TÔI</h2>
    <div className="contact-container">
      <div className="contact-map">
        <iframe
          title="Google Maps"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.858831526239!2d105.7631022759496!3d21.038132787402437!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab0e42a94c33%3A0xf3255bcb1c79f8c5!2zSOG6o2kgSMOyYSDEkMOgbywgSG_DoG4gS2llbSwgSGFub2kgMjAwMDAw!5e0!3m2!1svi!2s!4v1700000000000"
          width="130%"
          height="500"
          style={{ border: "0" }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      <div className="contact-form">
        <h2>FORM ĐIỀN THÔNG TIN</h2>
        <form>
          <input type="text" placeholder="Tên Doanh nghiệp/ Cá nhân" required />
          <input type="tel" placeholder="Điện thoại" required />
          <input type="email" placeholder="Email" required />
          <textarea placeholder="Nội dung yêu cầu" rows="4" required></textarea>
          <button type="submit">GỬI YÊU CẦU</button>
        </form>
      </div>
    </div>
    </>
  );
};

export default PageContact;
