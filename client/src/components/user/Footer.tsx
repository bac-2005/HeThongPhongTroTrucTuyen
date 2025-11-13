import React from 'react';
import '../../css/Footer.css'
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div>
            <h4>PHÒNG TRỌ, NHÀ TRỌ</h4>
            <ul>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=phong-tro-ha-dong">Phòng trọ Hà Đông</Link></li>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=phong-tro-cau-giay">Phòng trọ Cầu Giấy</Link></li>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=phong-tro-thanh-xuan">Phòng trọ Thanh Xuân</Link></li>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=phong-tro-dong-da">Phòng trọ Đống Đa</Link></li>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=phong-tro-long-bien">Phòng trọ Long Biên</Link></li>
            </ul>
          </div>

          <div>
            {/* <h4>THUÊ NHÀ NGUYÊN CĂN</h4> */}
            <ul>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=thue-nha-ha-dong">Thuê nhà Hà Đông</Link></li>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=thue-nha-cau-giay">Thuê nhà Cầu Giấy</Link></li>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=thue-nha-thanh-xuan">Thuê nhà Thanh Xuân</Link></li>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=thue-nha-dong-da">Thuê nhà Đống Đa</Link></li>
            </ul>
          </div>

          <div>
            {/* <h4>CHO THUÊ CĂN HỘ</h4> */}
            <ul>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=can-ho-cau-giay">Căn hộ Cầu Giấy</Link></li>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=can-ho-ha-dong">Căn hộ Hà Đông</Link></li>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=can-ho-thanh-xuan">Căn hộ Thanh Xuân</Link></li>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=can-ho-hoang-mai">Căn hộ Hoàng Mai</Link></li>
            </ul>
          </div>

          <div>
            {/* <h4>CHO THUÊ MẶT BẰNG</h4> */}
            <ul>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=mat-bang-hoan-kiem">Mặt bằng Hoàn Kiếm</Link></li>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=mat-bang-dong-da">Mặt bằng Đống Đa</Link></li>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=mat-bang-cau-giay">Mặt bằng Cầu Giấy</Link></li>
            </ul>
          </div>

          <div>
            {/* <h4>TÌM NGƯỜI Ở GHÉP</h4> */}
            <ul>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=o-ghep-ha-dong">Ở ghép Hà Đông</Link></li>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=o-ghep-thanh-xuan">Ở ghép Thanh Xuân</Link></li>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=o-ghep-cau-giay">Ở ghép Cầu Giấy</Link></li>
              <li className="hover:underline hover:decoration-blue-500" ><Link to="/?keyword=o-ghep-hoang-mai">Ở ghép Hoàng Mai</Link></li>
            </ul>
          </div>
        </div>


        <div className="footer-bottom">
          <div>
            <h4>VỀ PHONGTROTHONGMINH</h4>
            <ul>
              <li>Trọ Thông Minh là nền tảng hỗ trợ tìm, <br /> thuê và quản lý trọ nhanh chóng, <br /> tiện lợi và minh bạch cho cả người thuê lẫn chủ trọ.</li>
            </ul>
          </div>

          <div>
            <h4>THÔNG TIN LIÊN HỆ HỖ TRỢ</h4>
            <ul>
              <li>Hotline:0345981925</li>
              <li>Fanpage:Trọ Thông Minh</li>
              <li>Email:trothongminh@gmail.com</li>
            
       
            </ul>
          </div>

          <div>
            <h4>PHƯƠNG THỨC THANH TOÁN</h4>
            Online
          </div>

        </div>

        <div className="footer-contact">
          <p>Công Ty Phòng Trọ Thông Minh</p>
          <p>Email: cskh.phongtrothongminh@gmail.com</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
